// src/app/api/marketplace/save/route.ts
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

    // Save opportunity
    await supabase
      .from('saved_opportunities')
      .upsert({
        user_id: userId,
        opportunity_id: opportunityId,
        opportunity_type: type,
        saved_at: new Date().toISOString()
      }, { onConflict: 'user_id,opportunity_id' });

    // Track save action
    await supabase
      .from('marketplace_analytics')
      .insert({
        user_id: userId,
        opportunity_id: opportunityId,
        opportunity_type: type,
        action: 'save'
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving opportunity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save opportunity' },
      { status: 500 }
    );
  }
}
