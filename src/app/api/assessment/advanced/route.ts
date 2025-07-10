<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Assessment, CategoryAssessment } from '@/lib/types/database'

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number
  max: number
}

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10 // 10 requests per 5 minutes
}

// Input validation schema
function validateAdvancedAssessment(data: any): { isValid: boolean; errors?: string[] } {
  const errors: string[] = []
  
  if (!data.business_name || typeof data.business_name !== 'string' || data.business_name.length > 255) {
    errors.push('Business name is required and must be less than 255 characters')
  }
  
  if (!data.criteria || typeof data.criteria !== 'object') {
    errors.push('Criteria object is required')
  }
  
  if (!data.overall_score || typeof data.overall_score !== 'number' || data.overall_score < 0 || data.overall_score > 100) {
    errors.push('Overall score must be a number between 0 and 100')
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

// Rate limiting function
async function checkRateLimit(req: NextRequest): Promise<boolean> {
  try {
    const supabase = createClient()
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const key = `rate_limit_advanced_assessment:${ip}`
    
    const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.windowMs)
    
    // Count recent requests from this IP
    const { count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', key)
      .gte('timestamp', windowStart.toISOString())
    
    // Log this request attempt
    await supabase
      .from('audit_logs')
      .insert({
        session_id: key,
        table_name: 'rate_limit',
        operation: 'REQUEST',
        new_values: { endpoint: '/api/assessment/advanced', ip },
        timestamp: new Date().toISOString()
      })
    
    return (count || 0) < RATE_LIMIT_CONFIG.max
  } catch (error) {
    console.error('Rate limiting error:', error)
    return true // Fail open
  }
}

// Authentication function
async function authenticateUser(req: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  try {
    const supabase = createClient()
    
    // Get user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return {
        user: null,
        error: new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    // Log authentication for audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'auth',
        operation: 'AUTHENTICATE',
        ip_address: req.ip || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      })
    
    return { user }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      user: null,
      error: new NextResponse(
        JSON.stringify({ error: 'Authentication error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// POST - Create new advanced assessment
export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const rateLimitOk = await checkRateLimit(req)
    if (!rateLimitOk) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          retryAfter: Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000) 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000).toString()
          }
        }
      )
    }

    // 2. Authentication check
    const { user, error: authError } = await authenticateUser(req)
    if (authError) return authError

    // 3. Parse and validate input
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const validation = validateAdvancedAssessment(requestData)
    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validation.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 4. Create assessment in database
    const supabase = createClient()
    
    // Prepare assessment data
    const assessmentData = {
      user_id: user.id, // Ensure user can only create their own assessments
      overall_score: requestData.overall_score,
      assessment_version: '2.0',
      completion_time_minutes: requestData.completion_time_minutes || null,
      status: 'completed',
      metadata: {
        created_via: 'api',
        ip_address: req.ip || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
      }
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from('advanced_fundability_assessments')
      .insert(assessmentData)
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment creation error:', assessmentError)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create assessment' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 5. Create category assessments if provided
    if (requestData.categories && Array.isArray(requestData.categories)) {
      const categoryData = requestData.categories.map((category: any) => ({
        assessment_id: assessment.id,
        category_id: category.id,
        category_name: category.name,
        score: category.score,
        max_score: category.max_score || 100,
        weight: category.weight || 1.0,
        completion_percentage: category.completion_percentage || 100
      }))

      const { error: categoryError } = await supabase
        .from('category_assessments')
        .insert(categoryData)

      if (categoryError) {
        console.error('Category assessment error:', categoryError)
        // Continue even if category creation fails
      }
    }

    // 6. Log successful creation
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'advanced_fundability_assessments',
        operation: 'INSERT',
        new_values: { assessment_id: assessment.id },
        ip_address: req.ip || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      data: assessment
    })

  } catch (error) {
    console.error('Advanced assessment API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// GET - Retrieve user's advanced assessments
export async function GET(req: NextRequest) {
  try {
    // Authentication check (lighter for GET requests)
    const { user, error: authError } = await authenticateUser(req)
    if (authError) return authError

    const supabase = createClient()
    
    // Get URL parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeCategories = searchParams.get('include_categories') === 'true'

    // Fetch assessments (RLS automatically filters to user's own data)
    let query = supabase
      .from('advanced_fundability_assessments')
      .select('*')
      .order('assessment_date', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: assessments, error: assessmentError } = await query

    if (assessmentError) {
      console.error('Assessment fetch error:', assessmentError)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch assessments' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Optionally include category data
    let enrichedAssessments = assessments
    if (includeCategories && assessments.length > 0) {
      const assessmentIds = assessments.map((a: Assessment) => a.id)
      
      const { data: categories } = await supabase
        .from('category_assessments')
        .select('*')
        .in('assessment_id', assessmentIds)

      // Group categories by assessment_id
     const categoriesByAssessment = categories?.reduce((acc: Record<string, CategoryAssessment[]>, category: CategoryAssessment) => {
        if (!acc[category.assessment_id]) {
          acc[category.assessment_id] = []
        }
        acc[category.assessment_id].push(category)
        return acc
      }, {} as Record<string, any[]>) || {}

      // Add categories to assessments
      enrichedAssessments = assessments.map((assessment: Assessment) => ({
        ...assessment,
        categories: categoriesByAssessment[assessment.id] || []
      }))
    }

    // Log access for audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'advanced_fundability_assessments',
        operation: 'SELECT',
        new_values: { count: assessments.length },
        ip_address: req.ip || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      data: enrichedAssessments,
      pagination: {
        limit,
        offset,
        total: assessments.length
      }
    })

  } catch (error) {
    console.error('Advanced assessment GET API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// PUT - Update existing assessment
export async function PUT(req: NextRequest) {
  try {
    // Rate limiting and authentication
    const rateLimitOk = await checkRateLimit(req)
    if (!rateLimitOk) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { user, error: authError } = await authenticateUser(req)
    if (authError) return authError

    // Parse and validate input
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!requestData.id) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment ID is required for updates' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient()

    // Update assessment (RLS ensures user can only update their own)
    const { data: updatedAssessment, error: updateError } = await supabase
      .from('advanced_fundability_assessments')
      .update({
        overall_score: requestData.overall_score,
        completion_time_minutes: requestData.completion_time_minutes,
        status: requestData.status || 'completed',
        metadata: {
          ...requestData.metadata,
          updated_via: 'api',
          updated_at: new Date().toISOString()
        }
      })
      .eq('id', requestData.id)
      .select()
      .single()

    if (updateError) {
      console.error('Assessment update error:', updateError)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update assessment' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
=======
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
>>>>>>> 9027a76eb338fbaa421c2127d2ecdad194f2bf16
    }

    return NextResponse.json({
      success: true,
<<<<<<< HEAD
      data: updatedAssessment
    })

  } catch (error) {
    console.error('Advanced assessment PUT API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// DELETE - Delete assessment
export async function DELETE(req: NextRequest) {
  try {
    const { user, error: authError } = await authenticateUser(req)
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const assessmentId = searchParams.get('id')

    if (!assessmentId) {
      return new NextResponse(
        JSON.stringify({ error: 'Assessment ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient()

    // Delete assessment (RLS ensures user can only delete their own)
    const { error: deleteError } = await supabase
      .from('advanced_fundability_assessments')
      .delete()
      .eq('id', assessmentId)

    if (deleteError) {
      console.error('Assessment deletion error:', deleteError)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to delete assessment' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    })

  } catch (error) {
    console.error('Advanced assessment DELETE API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
=======
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
>>>>>>> 9027a76eb338fbaa421c2127d2ecdad194f2bf16
  }
}
