import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIScoringEngine } from '@/lib/ai-scoring-engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RecommendationRequest {
  assessmentId?: string;
  userId?: string;
  categoryScores?: Record<string, number>;
  industry?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    
    let categoryScores: Record<string, number> = {};
    let industry: string | undefined;

    if (body.assessmentId) {
      // Get assessment data from database
      const { data: assessment, error } = await supabase
        .from('advanced_fundability_assessments')
        .select('category_scores, metadata')
        .eq('id', body.assessmentId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }

      categoryScores = assessment.category_scores || {};
      industry = assessment.metadata?.industry;
    } else if (body.categoryScores) {
      // Use provided category scores
      categoryScores = body.categoryScores;
      industry = body.industry;
    } else {
      return NextResponse.json(
        { error: 'Either assessmentId or categoryScores must be provided' },
        { status: 400 }
      );
    }

    // Generate recommendations using AI scoring engine
    const recommendations = await AIScoringEngine.generateRecommendations(
      categoryScores,
      industry
    );

    // Get industry comparison if available
    let industryComparison = null;
    if (industry) {
      const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;
      industryComparison = await AIScoringEngine.getIndustryComparison(overallScore, industry);
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        categoryScores,
        industry,
        industryComparison
      }
    });

  } catch (error) {
    console.error('Recommendations generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const userId = searchParams.get('userId');

    if (!assessmentId && !userId) {
      return NextResponse.json(
        { error: 'Either assessmentId or userId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('assessment_recommendations')
      .select('*');

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId);
    } else if (userId) {
      // Get recommendations for user's latest assessment
      const { data: latestAssessment, error: assessmentError } = await supabase
        .from('advanced_fundability_assessments')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessmentError) {
        return NextResponse.json(
          { error: 'No assessments found for user' },
          { status: 404 }
        );
      }

      query = query.eq('assessment_id', latestAssessment.id);
    }

    const { data, error } = await query.order('priority', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve recommendations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recommendations' },
      { status: 500 }
    );
  }
}
