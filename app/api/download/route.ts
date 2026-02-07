import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetId = searchParams.get('assetId');
    const format = searchParams.get('format') || 'png';

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
    }

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

    // Fetch asset (ensure user owns it)
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*, projects(brand_name)')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (!asset.image_url) {
      return NextResponse.json({ error: 'Asset has no image' }, { status: 404 });
    }

    // Fetch user profile to check plan
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const isFree = profile?.plan === 'free';

    // Fetch the original image
    const imageResponse = await fetch(asset.image_url);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // For free users, add watermark
    if (isFree) {
      const watermarkedBuffer = await addWatermark(Buffer.from(imageBuffer));
      
      return new NextResponse(watermarkedBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${asset.type}-${asset.id.slice(0, 8)}-watermarked.png"`,
        },
      });
    }

    // For paid users, return original image
    const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
    
    return new NextResponse(Buffer.from(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${asset.type}-${asset.id.slice(0, 8)}.${format}"`,
      },
    });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // Dynamic import for server-side only
    const sharp = (await import('sharp')).default;
    
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    // Create SVG watermark
    const watermarkSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="watermark" patternUnits="userSpaceOnUse" width="200" height="200">
            <text
              x="100"
              y="100"
              font-family="Arial, sans-serif"
              font-size="24"
              font-weight="bold"
              fill="rgba(0, 0, 0, 0.15)"
              text-anchor="middle"
              dominant-baseline="middle"
              transform="rotate(-30 100 100)"
            >TASMIM</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermark)" />
        <text
          x="50%"
          y="50%"
          font-family="Arial, sans-serif"
          font-size="48"
          font-weight="bold"
          fill="rgba(255, 255, 255, 0.3)"
          stroke="rgba(0, 0, 0, 0.1)"
          stroke-width="1"
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(-30 ${width/2} ${height/2})"
        >TASMIM PREVIEW</text>
      </svg>
    `;

    const watermarkedImage = await image
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error('Watermark error:', error);
    // Return original image if watermarking fails
    return imageBuffer;
  }
}
