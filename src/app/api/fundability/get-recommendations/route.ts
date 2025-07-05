import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function calculatePercentile(userScore: number, industryAvg: number): number {
  if (userScore >= industryAvg * 1.5) return 90;
  if (userScore >= industryAvg * 1.25) return 75;
  if (userScore >= industryAvg) return 50;
  if (userScore >= industryAvg * 0.75) return 25;
  return 10;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const userId = searchParams.get('userId');

    if (!assessmentId || !userId) {
      return NextResponse.json(
        { error: 'Assessment ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('advanced_fundability_assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get recommendations for this assessment
    const { data: recommendations, error: recError } = await supabase
      .from('assessment_recommendations')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('priority', { ascending: true });

    if (recError) {
      console.error('Error fetching recommendations:', recError);
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      );
    }

    // Get industry benchmarks if available
    const { data: industryBenchmark } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('industry_name', assessment.metadata?.form_data?.industry)
      .single();

    // Define category mapping
    const categoryMapping: Record<string, string> = {
      business_registration: 'avg_business_registration',
      credit_profile: 'avg_credit_profile',
      financial_documentation: 'avg_financial_documentation',
      operational_infrastructure: 'avg_operational_infrastructure',
      online_presence: 'avg_online_presence',
      risk_compliance: 'avg_risk_compliance'
    };

    // Process recommendations with industry comparison
    const enrichedRecommendations = recommendations?.map((recommendation: any) => {
      if (!industryBenchmark) {
        return recommendation;
      }

      const categoryId = String(recommendation.category_id);
      const industryField = categoryMapping[categoryId];
      
      if (industryField && industryBenchmark[industryField] !== undefined) {
        const industryAvg = industryBenchmark[industryField];
        
        // Extract user score from assessment data with fallback options
        const userScore = assessment.category_scores?.[categoryId] || 
                         assessment.metadata?.category_scores?.[categoryId] || 
                         assessment.metadata?.[categoryId] || 
                         0;
        
        return {
          ...recommendation,
          industry_comparison: {
            industry_average: industryAvg,
            user_score: userScore,
            percentile_rank: calculatePercentile(userScore, industryAvg)
          }
        };
      }

      return recommendation;
    }) || [];

    return NextResponse.json({
      success: true,
      data: {
        assessment,
        recommendations: enrichedRecommendations,
        industry_benchmark: industryBenchmark
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
