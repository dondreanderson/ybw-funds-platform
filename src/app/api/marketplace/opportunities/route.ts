// src/app/api/marketplace/opportunities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedOpportunityService } from '@/lib/services/enhancedOpportunityService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'funding' | 'tradelines';
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    let opportunities;
    
    if (type === 'funding') {
      opportunities = await EnhancedOpportunityService.getPersonalizedFundingOpportunities(userId);
    } else if (type === 'tradelines') {
      opportunities = await EnhancedOpportunityService.getPersonalizedTradelineOpportunities(userId);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      opportunities,
      count: opportunities.length
    });

  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}
