import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIScoringEngine } from '@/lib/ai-scoring-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AssessmentRequest {
  userId: string;
  responses: Record<string, any>;
  assessmentType?: string;
  industry?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json();
    
    if (!body.userId || !body.responses) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and responses' },
        { status: 400 }
      );
    }

    // Calculate advanced score using AI scoring engine
    const scoringResult = await AIScoringEngine.calculateAdvancedScore(body.responses);

    // Get industry comparison if industry is provided
    let industryComparison = null;
    if (body.industry) {
      industryComparison = await AIScoringEngine.getIndustryComparison(
        scoringResult.overallScore,
        body.industry
      );
    }

    // Generate recommendations
    const recommendations = await AIScoringEngine.generateRecommendations(
      scoringResult.categoryScores,
      body.industry
    );

    // Save assessment to database
    const assessmentData = {
      user_id: body.userId,
      overall_score: scoringResult.overallScore,
      category_scores: scoringResult.categoryScores,
      completion_percentage: 100,
      recommendations: recommendations,
      improvement_areas: scoringResult.improvements,
      strengths: scoringResult.strengths,
      industry_comparison: industryComparison,
      assessment_date: new Date().toISOString(),
      assessment_version: '3.0',
      status: 'completed',
      metadata: {
        assessment_type: body.assessmentType || 'advanced',
        industry: body.industry,
        responses: body.responses
      }
    };

    const { data, error } = await supabase
      .from('advanced_fundability_assessments')
      .insert([assessmentData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        overallScore: scoringResult.overallScore,
        categoryScores: scoringResult.categoryScores,
        recommendations: recommendations,
        strengths: scoringResult.strengths,
        improvements: scoringResult.improvements,
        industryComparison: industryComparison
      }
    });

  } catch (error) {
    console.error('Assessment calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('advanced_fundability_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve assessments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Get assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessments' },
      { status: 500 }
    );
  }
}
