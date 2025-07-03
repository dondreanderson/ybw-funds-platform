import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { overallScore, assessments, userId } = await request.json()
    
    // Update user profile with new score
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ fundability_score: overallScore })
      .eq('id', userId)
    
    if (profileError) throw profileError
    
    // Add to score history
    const { error: historyError } = await supabase
      .from('score_history')
      .insert({
        user_id: userId,
        overall_score: overallScore,
        category_scores: assessments.reduce((acc, assessment) => {
          acc[assessment.categoryId] = Math.round((assessment.score / assessment.maxScore) * 100)
          return acc
        }, {}),
        assessment_date: new Date().toISOString().split('T')[0]
      })
    
    if (historyError) throw historyError
    
    return NextResponse.json({ 
      success: true, 
      message: 'Advanced assessment saved successfully!'
    })
    
  } catch (error) {
    console.error('Error saving advanced assessment:', error)
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    )
  }
}