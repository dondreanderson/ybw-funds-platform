import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      answers, 
      score, 
      recommendations,
      businessProfile 
    } = body

    // Validate required fields
    if (!userId || !answers || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, answers, or score' },
        { status: 400 }
      )
    }

    // Create assessment record in fundability_assessments table
    const { data: assessment, error: assessmentError } = await supabase
      .from('fundability_assessments')
      .insert({
        user_id: userId,
        business_name: businessProfile?.businessName || 'Simple Assessment',
        criteria_scores: answers,
        score: score,
        recommendations: recommendations?.join('\n') || '',
        status: 'completed',
        assessment_data: {
          assessment_type: 'simple',
          question_count: Object.keys(answers).length,
          completion_time: body.completionTime || null,
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment creation error:', assessmentError)
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      )
    }

    // Update user profile with latest score
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        fundability_score: score,
        last_assessment_date: new Date().toISOString(),
        assessment_count: supabase.raw('assessment_count + 1')
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Don't fail the request, just log the error
    }

    // Save to score history for tracking
    const { error: historyError } = await supabase
      .from('score_history')
      .insert({
        user_id: userId,
        assessment_id: assessment.id,
        overall_score: score,
        category_scores: {
          simple_assessment: {
            score: score,
            max_score: 100,
            answers: answers
          }
        },
        assessment_date: new Date().toISOString().split('T')[0]
      })

    if (historyError) {
      console.error('History save error:', historyError)
      // Don't fail the request, just log the error
    }

    // Save analytics data
    const { error: analyticsError } = await supabase
      .from('assessment_analytics')
      .insert({
        user_id: userId,
        assessment_date: new Date().toISOString().split('T')[0],
        overall_score: score,
        time_spent_minutes: body.completionTime || 0,
        categories_completed: 1,
        total_categories: 1
      })

    if (analyticsError) {
      console.error('Analytics save error:', analyticsError)
    }

    // Generate notifications for user
    if (score < 50) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Low Fundability Score Detected',
          message: `Your fundability score of ${score} indicates areas for improvement. Check your recommendations.`,
          type: 'warning'
        })
    } else if (score >= 80) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Excellent Fundability Score!',
          message: `Congratulations! Your fundability score of ${score} shows strong business readiness.`,
          type: 'success'
        })
    }

    return NextResponse.json({
      success: true,
      assessment: assessment,
      score: score,
      message: 'Assessment saved successfully'
    })

  } catch (error) {
    console.error('Save simple assessment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get latest simple assessment
    const { data: assessment, error } = await supabase
      .from('fundability_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Get assessment error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      assessment: assessment || null
    })

  } catch (error) {
    console.error('Get simple assessment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}