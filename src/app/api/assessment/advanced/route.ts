
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

}
