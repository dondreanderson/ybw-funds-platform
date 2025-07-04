import { NextRequest, NextResponse } from 'next/server';
import { aiScoringEngine } from '@/lib/ai-scoring-engine';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, assessmentId } = await request.json();

    if (!userId || !assessmentId) {
      return NextResponse.json(
        { error: 'User ID and Assessment ID are required' },
        { status: 400 }
      );
    }

    // Get latest assessment
    const { data: assessment, error } = await supabase
      .from('advanced_fundability_assessments')
      .select(`
        *,
        category_performances (*)
      `)
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single();

    if (error || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Generate fresh AI recommendations
    const assessmentData = {
      userId,
      businessType: assessment.metadata?.businessType || 'general',
      industry: assessment.metadata?.industry || 'general',
      yearsInBusiness: 2, // Default, could be extracted from metadata
      annualRevenue: 100000, // Default, could be extracted from metadata
      completedCriteria: [], // Would need to rebuild from category_performances
      responses: {}
    };

    const scoringResult = await aiScoringEngine.calculateFundabilityScore(assessmentData);

    return NextResponse.json({
      success: true,
      recommendations: scoringResult.recommendations,
      improvementPotential: scoringResult.improvementPotential,
      fundabilityGrade: scoringResult.fundabilityGrade
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
