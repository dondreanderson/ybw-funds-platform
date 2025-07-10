import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiAssessmentEngine } from '@/lib/ai/assessmentEngine'

// Authentication function (reuse from previous implementation)
async function authenticateUser(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return {
        user: null,
        error: new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
    
    return { user }
  } catch (error) {
    return {
      user: null,
      error: new NextResponse(
        JSON.stringify({ error: 'Authentication error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const { user, error: authError } = await authenticateUser(req)
    if (authError) return authError

    // Parse request data
    const businessData = await req.json()

    // Run AI assessment
    const assessmentResult = await aiAssessmentEngine.assessBusiness(businessData)

    // Save to database
    const supabase = createClient()
    
    // Save main assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('advanced_fundability_assessments')
      .insert({
        user_id: user.id,
        overall_score: assessmentResult.overallScore,
        assessment_version: '3.0-ai',
        status: 'completed',
        metadata: {
          riskLevel: assessmentResult.riskLevel,
          fundingPotential: assessmentResult.fundingPotential,
          aiGenerated: true,
          generatedAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Assessment save error:', assessmentError)
      return new NextResponse(
        JSON.stringify({ error: 'Failed to save assessment' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Save category scores
    const categoryData = Object.entries(assessmentResult.categoryScores).map(([category, score]) => ({
      assessment_id: assessment.id,
      category_id: category,
      category_name: category.charAt(0).toUpperCase() + category.slice(1),
      score: score,
      max_score: 100,
      weight: 1.0,
      completion_percentage: 100
    }))

    await supabase
      .from('category_assessments')
      .insert(categoryData)

    // Save recommendations
    const recommendationData = assessmentResult.recommendations.map(rec => ({
      assessment_id: assessment.id,
      category_id: rec.category.toLowerCase().replace(' ', '_'),
      recommendation_type: 'ai_generated',
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      estimated_impact_points: rec.impact,
      estimated_timeframe: rec.timeframe,
      action_items: rec.actionItems,
      resources: { resources: rec.resources }
    }))

    await supabase
      .from('assessment_recommendations')
      .insert(recommendationData)

    // Save to score history
    await supabase
      .from('score_history')
      .insert({
        user_id: user.id,
        assessment_id: assessment.id,
        overall_score: assessmentResult.overallScore,
        category_scores: assessmentResult.categoryScores,
        assessment_date: new Date().toISOString().split('T')[0]
      })

    return NextResponse.json({
      success: true,
      data: {
        assessmentId: assessment.id,
        ...assessmentResult
      }
    })

  } catch (error) {
    console.error('AI Assessment API error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
