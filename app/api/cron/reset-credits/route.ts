import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint is called by Vercel Cron on the 1st of each month
// It resets credits for all active subscribers

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this automatically)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In development, allow without auth
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Use service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Get all active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, plan')
      .eq('status', 'active')
      .in('plan', ['starter', 'pro']);

    if (subError) {
      console.error('Failed to fetch subscriptions:', subError);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No active subscriptions to reset',
        processed: 0 
      });
    }

    // Credit amounts by plan
    const creditsByPlan: Record<string, number> = {
      starter: 15,
      pro: 50,
    };

    let processed = 0;
    let failed = 0;

    // Reset credits for each subscriber
    for (const sub of subscriptions) {
      const credits = creditsByPlan[sub.plan];
      if (!credits) continue;

      try {
        // Use the add_credits function to reset
        const { error } = await supabase.rpc('add_credits', {
          p_user_id: sub.user_id,
          p_amount: credits,
          p_reason: 'subscription_renewal',
        });

        if (error) {
          console.error(`Failed to reset credits for ${sub.user_id}:`, error);
          failed++;
        } else {
          processed++;
        }
      } catch (err) {
        console.error(`Error processing ${sub.user_id}:`, err);
        failed++;
      }
    }

    // Also reset designer consult availability for Pro users
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const proUserIds = subscriptions
      .filter(s => s.plan === 'pro')
      .map(s => s.user_id);

    if (proUserIds.length > 0) {
      // Create new consult records for the month
      const consultRecords = proUserIds.map(userId => ({
        user_id: userId,
        month_key: currentMonth,
        used: false,
        iterations_used: 0,
        iterations_limit: 5,
      }));

      await supabase.from('designer_consults').upsert(consultRecords, {
        onConflict: 'user_id,month_key',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Credit reset complete`,
      processed,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Vercel cron config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
