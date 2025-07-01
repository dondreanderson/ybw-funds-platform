import { NextRequest, NextResponse } from 'next/server';
import { FundabilityEngine } from '@/lib/fundability-engine';
import { FundabilityCriteria } from '@/types/fundability';

export async function POST(request: NextRequest) {
  try {
    const criteria: FundabilityCriteria = await request.json();
    
    // Validate input
    if (!criteria) {
      return NextResponse.json(
        { error: 'Missing criteria data' },
        { status: 400 }
      );
    }

    // Calculate score and recommendations
    const score = FundabilityEngine.calculateScore(criteria);
    const recommendations = FundabilityEngine.generateRecommendations(criteria, score);

    return NextResponse.json({
      score,
      recommendations,
      calculatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error calculating fundability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Fundability Calculator API',
    version: '1.0.0',
    endpoints: {
      calculate: 'POST /api/fundability/calculate',
      save: 'POST /api/fundability/save',
      history: 'GET /api/fundability/history'
    }
  });
}