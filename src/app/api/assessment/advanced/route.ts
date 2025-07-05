import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface AssessmentRequest {
  userId: string;
  formData: {
    businessAge: string;
    businessType: string;
    industry: string;
    revenue: string;
    employees: string;
    creditScore: string;
    cashFlow: string;
    profitability: string;
    debt: string;
    fundingAmount: string;
    fundingPurpose: string;
    timeframe: string;
    collateral: string;
    experience: string;
    businessPlan: string;
    marketPosition: string;
    growth: string;
  };
}

interface AssessmentResult {
  score: number;
  grade: string;
  category: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  percentile?: number;
  industryComparison?: any;
}

// Helper function to calculate percentile
function calculatePercentile(score: number, benchmarks: any): number {
  if (score >= benchmarks.percentile_90) return 90;
  if (score >= benchmarks.percentile_75) return 75;
  if (score >= benchmarks.percentile_50) return 50;
  if (score >= benchmarks.percentile_25) return 25;
  return 10;
}

// Helper function to calculate assessment score
function calculateAssessmentScore(formData: AssessmentRequest['formData']): AssessmentResult {
  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Business Age scoring
  const ageScores: { [key: string]: number } = {
    'Less than 1 year': 10,
    '1-2 years': 20,
    '2-5 years': 30,
    '5-10 years': 40,
    'Over 10 years': 50
  };
  score += ageScores[formData.businessAge] || 0;

  // Revenue scoring
  const revenueScores: { [key: string]: number } = {
    'Under $100K': 5,
    '$100K-$500K': 15,
    '$500K-$1M': 25,
    '$1M-$5M': 35,
    '$5M-$10M': 45,
    'Over $10M': 50
  };
  score += revenueScores[formData.revenue] || 0;

  // Credit Score scoring
  const creditScores: { [key: string]: number } = {
    'Below 600': 5,
    '600-650': 15,
    '650-700': 25,
    '700-750': 35,
    'Above 750': 45
  };
  score += creditScores[formData.creditScore] || 0;

  // Cash Flow scoring
  const cashFlowScores: { [key: string]: number } = {
    'Negative': 0,
    'Break-even': 10,
    'Positive but tight': 20,
    'Healthy positive': 35,
    'Very strong': 45
  };
  score += cashFlowScores[formData.cashFlow] || 0;

  // Profitability scoring
  const profitScores: { [key: string]: number } = {
    'Not profitable': 0,
    'Break-even': 10,
    'Marginally profitable': 20,
    'Profitable': 35,
    'Highly profitable': 45
  };
  score += profitScores[formData.profitability] || 0;

  // Experience scoring
  const expScores: { [key: string]: number } = {
    'Less than 2 years': 5,
    '2-5 years': 15,
    '5-10 years': 25,
    '10-20 years': 35,
    'Over 20 years': 40
  };
  score += expScores[formData.experience] || 0;

  // Business Plan scoring
  const planScores: { [key: string]: number } = {
    'No formal plan': 0,
    'Basic plan': 10,
    'Detailed plan': 20,
    'Professional plan': 30,
    'Comprehensive with projections': 40
  };
  score += planScores[formData.businessPlan] || 0;

  // Generate strengths and improvements
  if (formData.businessAge === 'Over 10 years') {
    strengths.push('Established business with long track record');
  } else if (formData.businessAge === 'Less than 1 year') {
    improvements.push('Build business history and track record');
  }

  if (formData.revenue === 'Over $10M') {
    strengths.push('Strong revenue demonstrates business viability');
  } else if (formData.revenue === 'Under $100K') {
    improvements.push('Focus on increasing revenue streams');
  }

  if (formData.creditScore === 'Above 750') {
    strengths.push('Excellent credit score enhances funding options');
  } else if (formData.creditScore === 'Below 600') {
    improvements.push('Improve personal credit score before applying');
  }

  if (formData.cashFlow === 'Very strong') {
    strengths.push('Strong cash flow indicates good financial management');
  } else if (formData.cashFlow === 'Negative') {
    improvements.push('Address cash flow issues before seeking funding');
  }

  if (formData.profitability === 'Highly profitable') {
    strengths.push('High profitability demonstrates business efficiency');
  }

  if (formData.experience === 'Over 20 years') {
    strengths.push('Extensive industry experience reduces lender risk');
  }

  if (formData.businessPlan === 'No formal plan') {
    improvements.push('Develop a comprehensive business plan');
  }

  // Determine grade and category
  let grade: string;
  let category: string;
  
  if (score >= 300) {
    grade = 'A+';
    category = 'Excellent';
  } else if (score >= 250) {
    grade = 'A';
    category = 'Very Good';
  } else if (score >= 200) {
    grade = 'B+';
    category = 'Good';
  } else if (score >= 150) {
    grade = 'B';
    category = 'Fair';
  } else if (score >= 100) {
    grade = 'C';
    category = 'Poor';
  } else {
    grade = 'D';
    category = 'Very Poor';
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (score < 200) {
    recommendations.push('Consider alternative funding options like merchant cash advances');
    recommendations.push('Work on improving credit score and cash flow');
    recommendations.push('Develop a stronger business plan with financial projections');
  } else if (score < 300) {
    recommendations.push('You qualify for most traditional funding options');
    recommendations.push('Consider SBA loans for favorable terms');
    recommendations.push('Prepare detailed financial documentation');
  } else {
    recommendations.push('You qualify for premium funding options');
    recommendations.push('Consider multiple lenders to get the best terms');
    recommendations.push('You may qualify for unsecured funding options');
  }

  return {
    score,
    grade,
    category,
    recommendations,
    strengths,
    improvements
  };
}

// POST handler for advanced assessment
export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.formData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate assessment score
    const result = calculateAssessmentScore(body.formData);

    // Get industry benchmarks (optional)
    let industryComparison = null;
    try {
      const { data: benchmarks } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('industry_name', body.formData.industry)
        .single();

      if (benchmarks) {
        result.percentile = calculatePercentile(result.score, benchmarks);
        industryComparison = benchmarks;
      }
    } catch (error) {
      console.log('No industry benchmarks found, continuing without comparison');
    }

    // Save assessment to database
    const assessmentData = {
      user_id: body.userId,
      overall_score: result.score,
      category_scores: {
        business_age: body.formData.businessAge,
        revenue: body.formData.revenue,
        credit_score: body.formData.creditScore,
        cash_flow: body.formData.cashFlow,
        profitability: body.formData.profitability,
        experience: body.formData.experience,
        business_plan: body.formData.businessPlan
      },
      completion_percentage: 100,
      recommendations: result.recommendations,
      improvement_areas: result.improvements,
      strengths: result.strengths,
      industry_comparison: industryComparison,
      assessment_date: new Date().toISOString(),
      assessment_version: '2.0',
      status: 'completed',
      metadata: {
        form_data: body.formData,
        grade: result.grade,
        category: result.category,
        percentile: result.percentile
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
        ...result,
        percentile: result.percentile,
        industryComparison
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

// GET handler for retrieving assessments
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve assessments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
