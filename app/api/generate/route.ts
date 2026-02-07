import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createImageProvider, buildPromptFromProject, enhancePromptForArabic } from '@/lib/ai/image-provider';
import type { Database } from '@/types/database';

// Request validation schema
const generateRequestSchema = z.object({
  projectId: z.string().uuid(),
  assetType: z.enum(['logo', 'icon', 'pattern', 'social_post', 'stationery', 'favicon', 'wordmark']),
  additionalPrompt: z.string().optional(),
});

// Rate limiting: simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check credits/trials
    const isFree = profile.plan === 'free';
    const trialsRemaining = 2 - (profile.trial_generations_used || 0);
    const creditsRemaining = profile.credits_balance || 0;

    if (isFree && trialsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No free trials remaining. Please upgrade to continue.' },
        { status: 403 }
      );
    }

    if (!isFree && creditsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No credits remaining. Please purchase more to continue.' },
        { status: 403 }
      );
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', validatedData.projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create asset record with "in_progress" status
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert([{
        project_id: project.id,
        user_id: user.id,
        type: validatedData.assetType,
        status: 'in_progress',
        is_watermarked: isFree, // Free users get watermarked assets
      }] as any)
      .select()
      .single();

    if (assetError || !asset) {
      console.error('Failed to create asset:', assetError);
      return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
    }

    // Build prompt
    let prompt = buildPromptFromProject(
      {
        brand_name: project.brand_name,
        brand_name_ar: project.brand_name_ar,
        industry: project.industry,
        keywords: project.keywords || [],
        style: project.style as { mood?: string; complexity?: string } | undefined,
        description: project.description,
      },
      validatedData.assetType,
      validatedData.additionalPrompt
    );

    // Enhance for Arabic if needed
    if (project.brand_name_ar) {
      prompt = enhancePromptForArabic(prompt, project.brand_name_ar);
    }

    // Use credits atomically
    const { data: creditResult, error: creditError } = await supabase.rpc('use_credits', {
      p_user_id: user.id,
      p_amount: 1,
      p_reason: 'generation',
      p_reference_id: asset.id,
    });

    if (creditError) {
      // Rollback asset creation
      await supabase.from('assets').delete().eq('id', asset.id);
      console.error('Failed to use credits:', creditError);
      return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 });
    }

    // Generate image
    const startTime = Date.now();
    const imageProvider = createImageProvider();
    
    try {
      const result = await imageProvider.generate({
        prompt,
        size: getSizeForAssetType(validatedData.assetType),
        style: (project.style as any)?.mood || 'modern',
      });

      const processingTime = Date.now() - startTime;

      // Update asset with generated image
      const { error: updateError } = await supabase
        .from('assets')
        .update({
          status: 'done',
          image_url: result.url,
          prompt,
          model: imageProvider.name,
          metadata: {
            ...result.metadata,
            revisedPrompt: result.revisedPrompt,
          },
        })
        .eq('id', asset.id);

      if (updateError) {
        console.error('Failed to update asset:', updateError);
      }

      // Log generation
      await supabase.from('generations').insert([{
        user_id: user.id,
        project_id: project.id,
        asset_id: asset.id,
        request: {
          assetType: validatedData.assetType,
          additionalPrompt: validatedData.additionalPrompt,
        },
        response: result,
        provider: imageProvider.name,
        model: imageProvider.name,
        credits_used: 1,
        is_trial: isFree,
        processing_time_ms: processingTime,
      }] as any);

      return NextResponse.json({
        success: true,
        assetId: asset.id,
        imageUrl: result.url,
      });
    } catch (generationError) {
      // Update asset to failed status
      await supabase
        .from('assets')
        .update({
          status: 'failed',
          metadata: {
            error: generationError instanceof Error ? generationError.message : 'Unknown error',
          },
        })
        .eq('id', asset.id);

      // Log failed generation
      await supabase.from('generations').insert([{
        user_id: user.id,
        project_id: project.id,
        asset_id: asset.id,
        request: {
          assetType: validatedData.assetType,
          additionalPrompt: validatedData.additionalPrompt,
        },
        response: null,
        provider: imageProvider.name,
        credits_used: 1,
        is_trial: isFree,
        error_message: generationError instanceof Error ? generationError.message : 'Unknown error',
      }] as any);

      console.error('Generation failed:', generationError);
      return NextResponse.json(
        { error: 'Image generation failed. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getSizeForAssetType(assetType: string): { width: number; height: number } {
  switch (assetType) {
    case 'favicon':
      return { width: 512, height: 512 };
    case 'icon':
      return { width: 512, height: 512 };
    case 'social_post':
      return { width: 1080, height: 1080 };
    case 'pattern':
      return { width: 1024, height: 1024 };
    case 'stationery':
      return { width: 1024, height: 1024 };
    case 'logo':
    case 'wordmark':
    default:
      return { width: 1024, height: 1024 };
  }
}
