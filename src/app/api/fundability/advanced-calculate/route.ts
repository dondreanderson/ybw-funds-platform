import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CalculationRequest {
  assessments: {
    categoryId: string
    responses: Record
    score: number
    maxScore: number
  }[]
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const { assessments, userId }: CalculationRequest = await request.json()
    
    // Calculate overall weighted score
    const categoryWeights = {
      'business_registration': 0.20,
      'credit_profile': 0.25,
      'financial_documentation': 0.20,
      'operations': 0.15,
      'online_presence': 0.10,
      'risk_compliance': 0.10
    }
    
    let weightedScore = 0
    let totalWeight = 0
    
    assessments.forEach(assessment => {
      const weight = categoryWeights[assessment.categoryId] || 0
      const categoryPercentage = assessment.score / assessment.maxScore
      weightedScore += categoryPercentage * weight * 100
      totalWeight += weight
    })
    
    const overallScore = Math.round(weightedScore / totalWeight)
    
    // Generate recommendations based on low-scoring areas
    const recommendations = generateRecommendations(assessments)
    
    // Save to database
    const { data: assessmentRecord, error: assessmentError } = await supabase
      .from('advanced_fundability_assessments')
      .insert({
        user_id: userId,
        overall_score: overallScore,
        completion_time_minutes: 25 // Could be calculated from frontend
      })
      .select()
      .single()
    
    if (assessmentError) throw assessmentError
    
    // Save category assessments
    for (const assessment of assessments) {
      const { error: categoryError } = await supabase
        .from('category_assessments')
        .insert({
          assessment_id: assessmentRecord.id,
          category_id: assessment.categoryId,
          category_name: getCategoryName(assessment.categoryId),
          score: assessment.score,
          max_score: assessment.maxScore,
          weight: categoryWeights[assessment.categoryId] || 0,
          completion_percentage: 100
        })
      
      if (categoryError) throw categoryError
    }
    
    // Save recommendations
    for (const recommendation of recommendations) {
      const { error: recError } = await supabase
        .from('assessment_recommendations')
        .insert({
          assessment_id: assessmentRecord.id,
          category_id: recommendation.categoryId,
          recommendation_type: recommendation.type,
          title: recommendation.title,
          description: recommendation.description,
          priority: recommendation.priority,
          estimated_impact_points: recommendation.impactPoints,
          estimated_timeframe: recommendation.timeframe,
          action_items: recommendation.actionItems
        })
      
      if (recError) throw recError
    }
    
    return NextResponse.json({
      success: true,
      overallScore,
      assessmentId: assessmentRecord.id,
      recommendations
    })
    
  } catch (error) {
    console.error('Error calculating advanced assessment:', error)
    return NextResponse.json(
      { error: 'Failed to calculate assessment' },
      { status: 500 }
    )
  }
}

function generateRecommendations(assessments: any[]) {
  const recommendations = []
  
  assessments.forEach(assessment => {
    const percentage = (assessment.score / assessment.maxScore) * 100
    
    if (percentage < 70) {
      switch (assessment.categoryId) {
        case 'business_registration':
          recommendations.push({
            categoryId: assessment.categoryId,
            type: 'business_setup',
            title: 'Complete Business Registration',
            description: 'Strengthen your business foundation with proper registration and documentation.',
            priority: 'high',
            impactPoints: 15,
            timeframe: '2-4 weeks',
            actionItems: [
              'Obtain EIN if not already done',
              'Register with state if not completed',
              'Create operating agreements or bylaws',
              'Obtain necessary business licenses'
            ]
          })
          break
        case 'credit_profile':
          recommendations.push({
            categoryId: assessment.categoryId,
            type: 'credit_building',
            title: 'Improve Business Credit Profile',
            description: 'Build and enhance your business credit to access better funding opportunities.',
            priority: 'high',
            impactPoints: 20,
            timeframe: '3-6 months',
            actionItems: [
              'Apply for business credit cards',
              'Establish trade lines with vendors',
              'Monitor credit reports regularly',
              'Pay all bills on time',
              'Keep credit utilization below 30%'
            ]
          })
          break
        // Add more categories...
      }
    }
  })
  
  return recommendations
}

function getCategoryName(categoryId: string): string {
  const names = {
    'business_registration': 'Business Registration & Structure',
    'credit_profile': 'Credit Profile & History',
    'financial_documentation': 'Financial Documentation',
    'operations': 'Operational Infrastructure',
    'online_presence': 'Online Presence & Marketing',
    'risk_compliance': 'Risk Factors & Compliance'
  }
  return names[categoryId] || categoryId
}