import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AssessmentService } from '@/lib/services/assessmentService'
import { RecommendationService } from '@/lib/services/recommendationService'
import { AnalyticsService } from '@/lib/services/analyticsService'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { responses, businessData, metadata } = body

    // Initialize services
    const assessmentService = new AssessmentService(supabase)
    const recommendationService = new RecommendationService(supabase)
    const analyticsService = new AnalyticsService(supabase)

    // Create assessment record
    const assessment = await assessmentService.createAdvancedAssessment(user.id, {
      businessType: businessData.businessType,
      industry: businessData.industry,
      businessAgeMonths: businessData.businessAge,
      annualRevenue: businessData.annualRevenue,
      employeeCount: businessData.employeeCount
    })

    // Process responses and calculate scores
    const categoryScores = {}
    let totalScore = 0
    let maxPossibleScore = 0

    // Group responses by category
    const responsesByCategory = responses.reduce((acc, response) => {
      if (!acc[response.category]) {
        acc[response.category] = []
      }
      acc[response.category].push(response)
      return acc
    }, {})

    // Calculate category scores
    for (const [category, categoryResponses] of Object.entries(responsesByCategory)) {
      let categoryScore = 0
      let categoryMaxScore = 0

      for (const response of categoryResponses) {
        // Save individual criterion response
        await assessmentService.saveCriterionResponse({
          assessmentId: assessment.id,
          userId: user.id,
          category: response.category,
          criterionId: response.criterionId,
          criterionName: response.criterionName,
          criterionDescription: response.criterionDescription,
          responseValue: response.responseValue,
          responseType: response.responseType,
          pointsEarned: response.pointsEarned,
          pointsPossible: response.pointsPossible,
          weightFactor: response.weightFactor || 1.0,
          isCritical: response.isCritical,
          requiresImprovement: response.requiresImprovement,
          improvementPriority: response.improvementPriority
        })

        categoryScore += response.pointsEarned * (response.weightFactor || 1.0)
        categoryMaxScore += response.pointsPossible * (response.weightFactor || 1.0)
      }

      categoryScores[category] = Math.round((categoryScore / categoryMaxScore) * 100)
      totalScore += categoryScore
      maxPossibleScore += categoryMaxScore

      // Save category assessment
      await assessmentService.saveCategoryAssessment(assessment.id, {
        categoryId: category.toLowerCase().replace(/\s+/g, '_'),
        categoryName: category,
        score: categoryScore,
        maxScore: categoryMaxScore,
        weight: 1.0,
        completionPercentage: 100
      })
    }

    const overallScore = Math.round((totalScore / maxPossibleScore) * 100)
    const completionPercentage = 100

    // Generate AI recommendations
    const recommendations = await recommendationService.generateRecommendations(
      assessment.id,
      {
        categoryScores,
        overallScore,
        businessType: businessData.businessType,
        industry: businessData.industry,
        responses
      }
    )

    // Get industry benchmarks for comparison
    const industryBenchmarks = await analyticsService.getIndustryBenchmarks(
      businessData.industry,
      businessData.businessSize
    )

    // Calculate industry comparison
    const industryComparison = {
      userScore: overallScore,
      industryAverage: industryBenchmarks.avg_total_score,
      percentile: this.calculatePercentile(overallScore, industryBenchmarks),
      categoryComparisons: Object.entries(categoryScores).reduce((acc, [category, score]) => {
        const benchmarkField = `avg_${category.toLowerCase().replace(/\s+/g, '_')}`
        acc[category] = {
          userScore: score,
          industryAverage: industryBenchmarks[benchmarkField] || 65,
          difference: score - (industryBenchmarks[benchmarkField] || 65)
        }
        return acc
      }, {})
    }

    // Update assessment with final scores
    const updatedAssessment = await assessmentService.updateAssessmentScore(
      assessment.id,
      {
        overallScore,
        categoryScores,
        completionPercentage,
        recommendations: recommendations.map(r => r.title),
        improvementAreas: recommendations.filter(r => r.priority === 'high').map(r => r.title),
        strengths: Object.entries(categoryScores)
          .filter(([_, score]) => score >= 80)
          .map(([category]) => category),
        industryComparison
      }
    )

    // Record analytics
    await analyticsService.recordAssessmentAnalytics(user.id, {
      assessmentDate: new Date().toISOString(),
      overallScore,
      timeSpentMinutes: metadata.timeSpentMinutes,
      categoriesCompleted: Object.keys(categoryScores).length,
      totalCategories: Object.keys(categoryScores).length,
      industryPercentile: industryComparison.percentile
    })

    // Update score history
    await analyticsService.updateScoreHistory(user.id, assessment.id, {
      overallScore,
      categoryScores,
      assessmentDate: new Date().toISOString()
    })

    return NextResponse.json({
      assessment: updatedAssessment,
      recommendations,
      industryComparison,
      categoryScores
    })

  } catch (error) {
    console.error('Assessment API error:', error)
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    )
  }
}

private calculatePercentile(score: number, benchmarks: any): number {
  if (score >= benchmarks.percentile_90) return 90
  if (score >= benchmarks.percentile_75) return 75
  if (score >= benchmarks.percentile_50) return 50
  if (score >= benchmarks.percentile_25) return 25
  return 10
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('assessmentId')

    if (assessmentId) {
      // Get specific assessment
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .select(`
          *,
          assessment_recommendations(*),
          category_assessments(*),
          fundability_criteria_responses(*)
        `)
        .eq('id', assessmentId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return NextResponse.json({ assessment: data })
    } else {
      // Get user's assessment history
      const assessmentService = new AssessmentService(supabase)
      const assessments = await assessmentService.getUserAssessmentHistory(user.id)
      return NextResponse.json({ assessments })
    }

  } catch (error) {
    console.error('Get assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    )
  }
}