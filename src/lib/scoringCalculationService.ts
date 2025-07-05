import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ScoringResult {
  overallScore: number
  maxPossibleScore: number
  percentageScore: number
  categoryScores: CategoryScore[]
  completedCriteria: number
  totalCriteria: number
  completionPercentage: number
}

export interface CategoryScore {
  category: string
  score: number
  maxScore: number
  percentage: number
  weight: number
  weightedScore: number
  completedCriteria: number
  totalCriteria: number
}

export class ScoringCalculationService {
  // Calculate comprehensive score for an assessment
  static async calculateAssessmentScore(assessmentId: string): Promise<ScoringResult> {
    try {
      // Get all responses for the assessment
      const { data: responses, error: responsesError } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)

      if (responsesError) {
        throw new Error(`Failed to fetch responses: ${responsesError.message}`)
      }

      // Get all criteria to calculate max possible scores
      const { data: criteria, error: criteriaError } = await supabase
        .from('fundability_criteria')
        .select('*')

      if (criteriaError) {
        throw new Error(`Failed to fetch criteria: ${criteriaError.message}`)
      }

      const responseMap = new Map()
      responses?.forEach(response => {
        responseMap.set(response.criterion_id, response)
      })

      // Calculate category scores
      const categoryScores: CategoryScore[] = []
      const categoryGroups = this.groupCriteriaByCategory(criteria || [])

      let totalScore = 0
      let totalMaxScore = 0
      let totalCompleted = 0
      let totalCriteria = criteria?.length || 0

      for (const [category, categoryCriteria] of Object.entries(categoryGroups)) {
        const categoryResult = this.calculateCategoryScore(
          category,
          categoryCriteria,
          responseMap
        )
        
        categoryScores.push(categoryResult)
        totalScore += categoryResult.weightedScore
        totalMaxScore += categoryResult.maxScore * categoryResult.weight
        totalCompleted += categoryResult.completedCriteria
      }

      const percentageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
      const completionPercentage = totalCriteria > 0 ? (totalCompleted / totalCriteria) * 100 : 0

      return {
        overallScore: Math.round(totalScore),
        maxPossibleScore: Math.round(totalMaxScore),
        percentageScore: Math.round(percentageScore * 100) / 100,
        categoryScores,
        completedCriteria: totalCompleted,
        totalCriteria,
        completionPercentage: Math.round(completionPercentage * 100) / 100
      }
    } catch (error) {
      console.error('Calculate assessment score error:', error)
      throw error
    }
  }

  // Calculate score for a specific category
  private static calculateCategoryScore(
    category: string,
    criteria: any[],
    responseMap: Map<string, any>
  ): CategoryScore {
    let categoryScore = 0
    let maxCategoryScore = 0
    let completedCriteria = 0
    const totalCriteria = criteria.length

    // Define category weights (can be moved to database)
    const categoryWeights: Record<string, number> = {
      'Business Foundation': 1.2,
      'Legal Structure': 1.1,
      'Banking & Finance': 1.3,
      'Business Credit Profile': 1.4,
      'Marketing Presence': 1.0,
      'Operational Excellence': 1.0,
      'Documentation': 1.1,
      'Financial Health': 1.2
    }

    const weight = categoryWeights[category] || 1.0

    criteria.forEach(criterion => {
      const response = responseMap.get(criterion.id)
      const criterionWeight = criterion.weight || 1
      
      maxCategoryScore += criterionWeight
      
      if (response) {
        completedCriteria++
        categoryScore += response.points_earned || 0
      }
    })

    const percentage = maxCategoryScore > 0 ? (categoryScore / maxCategoryScore) * 100 : 0
    const weightedScore = categoryScore * weight

    return {
      category,
      score: categoryScore,
      maxScore: maxCategoryScore,
      percentage: Math.round(percentage * 100) / 100,
      weight,
      weightedScore: Math.round(weightedScore),
      completedCriteria,
      totalCriteria
    }
  }

  // Group criteria by category
  private static groupCriteriaByCategory(criteria: any[]): Record<string, any[]> {
    return criteria.reduce((groups, criterion) => {
      const category = criterion.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(criterion)
      return groups
    }, {} as Record<string, any[]>)
  }

  // Calculate improvement priority scores
  static calculateImprovementPriority(categoryScores: CategoryScore[]): Array<{category: string, priority: number, impact: number}> {
    return categoryScores
      .map(cat => ({
        category: cat.category,
        priority: this.calculatePriority(cat),
        impact: this.calculateImpact(cat)
      }))
      .sort((a, b) => b.priority - a.priority)
  }

  private static calculatePriority(categoryScore: CategoryScore): number {
    // Lower percentage = higher priority
    const percentageScore = 100 - categoryScore.percentage
    // Higher weight = higher priority
    const weightScore = categoryScore.weight * 10
    // Lower completion = higher priority
    const completionScore = categoryScore.totalCriteria > 0 
      ? (categoryScore.totalCriteria - categoryScore.completedCriteria) * 5 
      : 0

    return percentageScore + weightScore + completionScore
  }

  private static calculateImpact(categoryScore: CategoryScore): number {
    // Potential points that could be gained
    const potentialGain = categoryScore.maxScore - categoryScore.score
    // Weighted by category importance
    return potentialGain * categoryScore.weight
  }

  // Update assessment with calculated scores
  static async updateAssessmentScores(assessmentId: string, scoringResult: ScoringResult) {
    try {
      const { error } = await supabase
        .from('advanced_fundability_assessments')
        .update({
          overall_score: scoringResult.overallScore,
          category_scores: scoringResult.categoryScores,
          completion_percentage: scoringResult.completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)

      if (error) {
        throw new Error(`Failed to update assessment scores: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Update assessment scores error:', error)
      throw error
    }
  }
}