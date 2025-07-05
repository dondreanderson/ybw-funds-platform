import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const assessmentId = searchParams.get('assessmentId')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('assessment_recommendations')
      .select(`
        id,
        assessment_id,
        category_id,
        recommendation_type,
        title,
        description,
        priority,
        estimated_impact_points,
        estimated_timeframe,
        action_items,
        resources,
        created_at
      `)

    // Filter by assessment if provided
    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    } else {
      // Get latest assessment for user
      const { data: latestAssessment } = await supabase
        .from('advanced_fundability_assessments')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestAssessment) {
        query = query.eq('assessment_id', latestAssessment.id)
      }
    }

    // Apply filters
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (category) {
      query = query.eq('category_id', category)
    }

    // Order by priority and impact
    query = query
      .order('priority', { ascending: true }) // high, medium, low
      .order('estimated_impact_points', { ascending: false })
      .limit(limit)

    const { data: recommendations, error: recommendationsError } = await query

    if (recommendationsError) {
      console.error('Recommendations error:', recommendationsError)
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      )
    }

    // Get user's business profile for personalized recommendations
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select(`
        business_structure,
        industry,
        years_in_business,
        annual_revenue,
        employees_count,
        has_ein,
        has_business_address,
        has_business_phone,
        has_business_website,
        has_business_email,
        has_duns_number
      `)
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Business profile error:', profileError)
    }

    // Get industry benchmarks for context
    const { data: industryBenchmark, error: benchmarkError } = await supabase
      .from('industry_benchmarks')
      .select(`
        avg_total_score,
        avg_business_registration,
        avg_credit_profile,
        avg_financial_documentation,
        avg_operational_infrastructure,
        avg_online_presence,
        avg_risk_compliance,
        percentile_25,
        percentile_50,
        percentile_75,
        percentile_90
      `)
      .eq('industry_name', businessProfile?.industry || '')
      .single()

    if (benchmarkError) {
      console.error('Industry benchmark error:', benchmarkError)
    }

    // Generate AI-powered personalized recommendations
    const personalizedRecommendations = await generatePersonalizedRecommendations(
      recommendations || [],
      businessProfile,
      industryBenchmark
    )

    // Get completion tracking for existing recommendations
    const { data: completionTracking, error: trackingError } = await supabase
      .from('fundability_recommendations_tracking')
      .select(`
        recommendation_id,
        status,
        notes,
        completed_at,
        created_at
      `)
      .in('recommendation_id', (recommendations || []).map(r => r.id))

    if (trackingError) {
      console.error('Tracking error:', trackingError)
    }

    // Categorize recommendations
    const categorizedRecommendations = categorizeRecommendations(
      personalizedRecommendations,
      completionTracking || []
    )

    // Calculate recommendation statistics
    const recommendationStats = calculateRecommendationStats(
      personalizedRecommendations,
      completionTracking || []
    )

    return NextResponse.json({
      success: true,
      data: {
        recommendations: personalizedRecommendations,
        categorized: categorizedRecommendations,
        businessProfile: businessProfile || null,
        industryBenchmark: industryBenchmark || null,
        completionTracking: completionTracking || [],
        stats: recommendationStats
      }
    })

  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, recommendations, userId } = body

    if (!assessmentId || !recommendations || !Array.isArray(recommendations)) {
      return NextResponse.json(
        { error: 'Assessment ID and recommendations array are required' },
        { status: 400 }
      )
    }

    // Insert recommendations
    const { data: insertedRecommendations, error: insertError } = await supabase
      .from('assessment_recommendations')
      .insert(
        recommendations.map(rec => ({
          assessment_id: assessmentId,
          category_id: rec.category_id,
          recommendation_type: rec.type || 'improvement',
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          estimated_impact_points: rec.estimated_impact_points,
          estimated_timeframe: rec.estimated_timeframe,
          action_items: rec.action_items,
          resources: rec.resources || {}
        }))
      )
      .select()

    if (insertError) {
      console.error('Insert recommendations error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save recommendations' },
        { status: 500 }
      )
    }

    // Initialize tracking for new recommendations
    const trackingData = insertedRecommendations.map(rec => ({
      assessment_id: assessmentId,
      recommendation_id: rec.id,
      status: 'pending'
    }))

    const { error: trackingError } = await supabase
      .from('fundability_recommendations_tracking')
      .insert(trackingData)

    if (trackingError) {
      console.error('Tracking insert error:', trackingError)
    }

    // Create notification for user
    if (userId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'New Recommendations Available',
          message: `You have ${recommendations.length} new recommendations to improve your fundability score.`,
          type: 'info'
        })
    }

    return NextResponse.json({
      success: true,
      recommendations: insertedRecommendations,
      message: 'Recommendations saved successfully'
    })

  } catch (error) {
    console.error('Save recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generatePersonalizedRecommendations(
  baseRecommendations: any[],
  businessProfile: any,
  industryBenchmark: any
) {
  return baseRecommendations.map(rec => {
    const personalized = { ...rec }

    // Adjust priority based on business profile
    if (businessProfile) {
      if (rec.category_id === 'business_registration' && !businessProfile.has_ein) {
        personalized.priority = 'high'
        personalized.estimated_impact_points = Math.max(rec.estimated_impact_points, 15)
      }

      if (rec.category_id === 'online_presence' && !businessProfile.has_business_website) {
        personalized.priority = businessProfile.years_in_business > 2 ? 'high' : 'medium'
      }

      // Adjust timeframe based on business maturity
      if (businessProfile.years_in_business < 1) {
        personalized.estimated_timeframe = adjustTimeframeForNewBusiness(rec.estimated_timeframe)
      }
    }

    // Add industry context
    if (industryBenchmark) {
      personalized.industry_context = generateIndustryContext(rec, industryBenchmark)
    }

    // Add detailed action steps
    personalized.detailed_steps = generateDetailedSteps(rec, businessProfile)

    return personalized
  })
}

function categorizeRecommendations(recommendations: any[], completionTracking: any[]) {
  const trackingMap = new Map(
    completionTracking.map(t => [t.recommendation_id, t])
  )

  return {
    high_priority: recommendations.filter(r => r.priority === 'high'),
    medium_priority: recommendations.filter(r => r.priority === 'medium'),
    low_priority: recommendations.filter(r => r.priority === 'low'),
    quick_wins: recommendations.filter(r => 
      r.estimated_timeframe && r.estimated_timeframe.includes('1-2') && r.estimated_impact_points > 5
    ),
    long_term: recommendations.filter(r => 
      r.estimated_timeframe && (r.estimated_timeframe.includes('month') || r.estimated_timeframe.includes('quarter'))
    ),
    completed: recommendations.filter(r => 
      trackingMap.get(r.id)?.status === 'completed'
    ),
    in_progress: recommendations.filter(r => 
      trackingMap.get(r.id)?.status === 'in_progress'
    )
  }
}

function calculateRecommendationStats(recommendations: any[], completionTracking: any[]) {
  const total = recommendations.length
  const completed = completionTracking.filter(t => t.status === 'completed').length
  const inProgress = completionTracking.filter(t => t.status === 'in_progress').length
  const totalImpact = recommendations.reduce((sum, r) => sum + (r.estimated_impact_points || 0), 0)
  const completedImpact = recommendations
    .filter(r => completionTracking.find(t => t.recommendation_id === r.id && t.status === 'completed'))
    .reduce((sum, r) => sum + (r.estimated_impact_points || 0), 0)

  return {
    total,
    completed,
    inProgress,
    pending: total - completed - inProgress,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    totalPotentialImpact: totalImpact,
    achievedImpact: completedImpact,
    remainingImpact: totalImpact - completedImpact
  }
}

function adjustTimeframeForNewBusiness(timeframe: string) {
  if (!timeframe) return timeframe
  
  // Extend timeframes for new businesses
  if (timeframe.includes('1-2 weeks')) return '2-4 weeks'
  if (timeframe.includes('2-4 weeks')) return '1-2 months'
  if (timeframe.includes('1-2 months')) return '2-3 months'
  
  return timeframe
}

function generateIndustryContext(recommendation: any, industryBenchmark: any) {
  // Generate contextual information based on industry benchmarks
  const categoryMapping = {
    'business_registration': 'avg_business_registration',
    'credit_profile': 'avg_credit_profile',
    'financial_documentation': 'avg_financial_documentation',
    'operational_infrastructure': 'avg_operational_infrastructure',
    'online_presence': 'avg_online_presence',
    'risk_compliance': 'avg_risk_compliance'
  }

  const industryField = categoryMapping[recommendation.category_id]
  if (industryField && industryBenchmark[industryField]) {
    const industryAvg = industryBenchmark[industryField]
    return {
      industry_average: industryAvg,
      percentile_targets: {
        good: industryBenchmark.percentile_50,
        excellent: industryBenchmark.percentile_75,
        top_tier: industryBenchmark.percentile_90
      }
    }
  }

  return null
}

function generateDetailedSteps(recommendation: any, businessProfile: any) {
  // Generate detailed step-by-step instructions based on recommendation type
  const baseSteps = recommendation.action_items || []
  
  // Add context-specific steps based on business profile
  if (businessProfile && recommendation.category_id === 'business_registration') {
    if (!businessProfile.has_ein) {
      return [
        'Visit IRS.gov to apply for EIN online',
        'Gather required business information',
        'Complete Form SS-4 application',
        'Receive EIN confirmation',
        'Update business records with new EIN',
        ...baseSteps
      ]
    }
  }

  return baseSteps
}