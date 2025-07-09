// src/app/api/marketplace/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, opportunityId, type } = await request.json();

    if (!userId || !opportunityId || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Track application in analytics
    await supabase
      .from('marketplace_analytics')
      .insert({
        user_id: userId,
        opportunity_id: opportunityId,
        opportunity_type: type,
        action: 'apply'
      });

    // Save to funding applications if it's a funding opportunity
    if (type === 'funding') {
      await supabase
        .from('funding_applications')
        .insert({
          user_id: userId,
          opportunity_id: opportunityId,
          status: 'applied',
          applied_at: new Date().toISOString()
        });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track application' },
      { status: 500 }
    );
  }
}
