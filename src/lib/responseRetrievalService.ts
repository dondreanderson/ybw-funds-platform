import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface CriteriaResponse {
  id: string
  assessmentId: string
  userId: string
  category: string
  criterionId: string
  criterionName: string
  criterionDescription: string
  responseValue: any
  responseType: string
  pointsEarned: number
  pointsPossible: number
  weightFactor: number
  weightedScore: number
  isCritical: boolean
  requiresImprovement: boolean
  improvementPriority: number
  answeredAt: string
  createdAt: string
}

export class ResponseRetrievalService {
  // Get all responses for an assessment
  static async getAssessmentResponses(assessmentId: string): Promise<CriteriaResponse[]> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('category', { ascending: true })
        .order('criterion_id', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch assessment responses: ${error.message}`)
      }

      return data?.map(this.mapDatabaseResponse) || []
    } catch (error) {
      console.error('Get assessment responses error:', error)
      throw error
    }
  }

  // Get responses by category
  static async getCategoryResponses(assessmentId: string, category: string): Promise<CriteriaResponse[]> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('category', category)
        .order('criterion_id', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch category responses: ${error.message}`)
      }

      return data?.map(this.mapDatabaseResponse) || []
    } catch (error) {
      console.error('Get category responses error:', error)
      throw error
    }
  }

  // Get responses by user
  static async getUserResponses(userId: string, limit?: number): Promise<CriteriaResponse[]> {
    try {
      let query = supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch user responses: ${error.message}`)
      }

      return data?.map(this.mapDatabaseResponse) || []
    } catch (error) {
      console.error('Get user responses error:', error)
      throw error
    }
  }

  // Get specific response
  static async getResponse(assessmentId: string, criterionId: string): Promise<CriteriaResponse | null> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('criterion_id', criterionId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No response found
        }
        throw new Error(`Failed to fetch response: ${error.message}`)
      }

      return this.mapDatabaseResponse(data)
    } catch (error) {
      console.error('Get response error:', error)
      throw error
    }
  }

  // Get response statistics
  static async getResponseStatistics(assessmentId: string) {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)

      if (error) {
        throw new Error(`Failed to fetch response statistics: ${error.message}`)
      }

      const responses = data || []
      const totalResponses = responses.length
      const totalPointsEarned = responses.reduce((sum, r) => sum + (r.points_earned || 0), 0)
      const totalPointsPossible = responses.reduce((sum, r) => sum + (r.points_possible || 0), 0)
      const completionPercentage = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0

      // Group by category
      const categoryStats = responses.reduce((acc, response) => {
        const category = response.category
        if (!acc[category]) {
          acc[category] = {
            totalResponses: 0,
            pointsEarned: 0,
            pointsPossible: 0,
            completionPercentage: 0
          }
        }
        acc[category].totalResponses++
        acc[category].pointsEarned += response.points_earned || 0
        acc[category].pointsPossible += response.points_possible || 0
        acc[category].completionPercentage = acc[category].pointsPossible > 0 
          ? (acc[category].pointsEarned / acc[category].pointsPossible) * 100 
          : 0
        return acc
      }, {} as Record<string, any>)

      return {
        totalResponses,
        totalPointsEarned,
        totalPointsPossible,
        completionPercentage,
        categoryStats
      }
    } catch (error) {
      console.error('Get response statistics error:', error)
      throw error
    }
  }

  // Helper method to map database response to interface
  private static mapDatabaseResponse(dbResponse: any): CriteriaResponse {
    return {
      id: dbResponse.id,
      assessmentId: dbResponse.assessment_id,
      userId: dbResponse.user_id,
      category: dbResponse.category,
      criterionId: dbResponse.criterion_id,
      criterionName: dbResponse.criterion_name,
      criterionDescription: dbResponse.criterion_description,
      responseValue: dbResponse.response_value,
      responseType: dbResponse.response_type,
      pointsEarned: dbResponse.points_earned || 0,
      pointsPossible: dbResponse.points_possible || 0,
      weightFactor: dbResponse.weight_factor || 1.0,
      weightedScore: dbResponse.weighted_score || 0,
      isCritical: dbResponse.is_critical || false,
      requiresImprovement: dbResponse.requires_improvement || false,
      improvementPriority: dbResponse.improvement_priority || 0,
      answeredAt: dbResponse.answered_at,
      createdAt: dbResponse.created_at
    }
  }
}