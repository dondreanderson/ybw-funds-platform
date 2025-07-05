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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeDetails = searchParams.get('includeDetails') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get score history with pagination
    const { data: scoreHistory, error: historyError } = await supabase
      .from('score_history')
      .select(`
        id,
        overall_score,
        category_scores,
        assessment_date,
        score_change,
        created_at,
        assessment_id
      `)
      .eq('user_id', userId)
      .order('assessment_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (historyError) {
      console.error('Score history error:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch score history' },
        { status: 500 }
      )
    }

    // Get assessment analytics for trends
    const { data: analytics, error: analyticsError } = await supabase
      .from('assessment_analytics')
      .select(`
        assessment_date,
        overall_score,
        improvement_from_last,
        industry_percentile,
        time_spent_minutes,
        categories_completed,
        total_categories
      `)
      .eq('user_id', userId)
      .order('assessment_date', { ascending: false })
      .limit(30) // Last 30 assessments for trend analysis

    if (analyticsError) {
      console.error('Analytics error:', analyticsError)
    }

    // Calculate trend data
    const trendData = analytics ? calculateTrends(analytics) : null

    // If details requested, get full assessment data
    let detailedAssessments = null
    if (includeDetails && scoreHistory) {
      const assessmentIds = scoreHistory
        .map(h => h.assessment_id)
        .filter(Boolean)

      if (assessmentIds.length > 0) {
        const { data: assessments, error: assessmentError } = await supabase
          .from('fundability_assessments')
          .select(`
            id,
            business_name,
            criteria_scores,
            score,
            recommendations,
            status,
            created_at,
            assessment_data
          `)
          .in('id', assessmentIds)

        if (!assessmentError) {
          detailedAssessments = assessments
        }

        // Also get advanced assessments
        const { data: advancedAssessments, error: advancedError } = await supabase
          .from('advanced_fundability_assessments')
          .select(`
            id,
            overall_score,
            category_scores,
            completion_percentage,
            recommendations,
            created_at,
            assessment_version,
            status
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (!advancedError && advancedAssessments) {
          detailedAssessments = [
            ...(detailedAssessments || []),
            ...advancedAssessments.map(a => ({
              ...a,
              assessment_type: 'advanced'
            }))
          ]
        }
      }
    }

    // Get current user profile for context
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        fundability_score,
        last_assessment_date,
        assessment_count,
        business_name
      `)
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Calculate improvement statistics
    const improvementStats = calculateImprovementStats(scoreHistory || [])

    return NextResponse.json({
      success: true,
      data: {
        scoreHistory: scoreHistory || [],
        analytics: analytics || [],
        trendData,
        detailedAssessments,
        userProfile: userProfile || null,
        improvementStats,
        pagination: {
          limit,
          offset,
          total: scoreHistory?.length || 0,
          hasMore: (scoreHistory?.length || 0) === limit
        }
      }
    })

  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateTrends(analytics: any[]) {
  if (!analytics || analytics.length < 2) {
    return null
  }

  const scores = analytics.map(a => a.overall_score).filter(Boolean)
  const improvements = analytics.map(a => a.improvement_from_last).filter(Boolean)
  
  return {
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    totalImprovement: improvements.reduce((a, b) => a + b, 0),
    assessmentCount: analytics.length,
    latestScore: scores[0] || 0,
    scoreRange: {
      min: Math.min(...scores),
      max: Math.max(...scores)
    },
    averageCompletionTime: analytics
      .map(a => a.time_spent_minutes)
      .filter(Boolean)
      .reduce((a, b) => a + b, 0) / analytics.length || 0
  }
}

function calculateImprovementStats(scoreHistory: any[]) {
  if (!scoreHistory || scoreHistory.length < 2) {
    return {
      totalImprovement: 0,
      averageImprovement: 0,
      bestScore: scoreHistory?.[0]?.overall_score || 0,
      improvementTrend: 'stable'
    }
  }

  const scores = scoreHistory.map(h => h.overall_score).reverse() // Chronological order
  const improvements = []
  
  for (let i = 1; i < scores.length; i++) {
    improvements.push(scores[i] - scores[i - 1])
  }

  const totalImprovement = scores[scores.length - 1] - scores[0]
  const averageImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length
  const recentTrend = improvements.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, improvements.length)

  return {
    totalImprovement,
    averageImprovement,
    bestScore: Math.max(...scores),
    improvementTrend: recentTrend > 2 ? 'improving' : recentTrend < -2 ? 'declining' : 'stable',
    consecutiveImprovements: countConsecutiveImprovements(improvements),
    scoreVolatility: calculateVolatility(scores)
  }
}

function countConsecutiveImprovements(improvements: number[]) {
  let count = 0
  for (let i = improvements.length - 1; i >= 0; i--) {
    if (improvements[i] > 0) {
      count++
    } else {
      break
    }
  }
  return count
}

function calculateVolatility(scores: number[]) {
  if (scores.length < 2) return 0
  
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  return Math.sqrt(variance)
}