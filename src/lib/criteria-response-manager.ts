import { supabase } from '@/lib/supabase';

export interface CriteriaResponse {
  id: string
  assessment_id: string
  user_id: string
  category: string
  criterion_id: string
  criterion_name: string
  criterion_description?: string
  response_value: any
  response_type: 'boolean' | 'text' | 'number' | 'select'
  points_earned: number
  points_possible: number
  weight_factor: number
  weighted_score: number
  is_critical: boolean
  requires_improvement: boolean
  improvement_priority: number
}

export class CriteriaResponseManager {
  
  async saveCriteriaResponse(response: Partial<CriteriaResponse>): Promise<CriteriaResponse | null> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .insert({
          assessment_id: response.assessment_id,
          user_id: response.user_id,
          category: response.category,
          criterion_id: response.criterion_id,
          criterion_name: response.criterion_name,
          criterion_description: response.criterion_description,
          response_value: response.response_value,
          response_type: response.response_type,
          points_earned: response.points_earned || 0,
          points_possible: response.points_possible || 0,
          weight_factor: response.weight_factor || 1.0,
          weighted_score: this.calculateWeightedScore(
            response.points_earned || 0,
            response.weight_factor || 1.0
          ),
          is_critical: response.is_critical || false,
          requires_improvement: response.requires_improvement || false,
          improvement_priority: response.improvement_priority || 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving criteria response:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in saveCriteriaResponse:', error)
      return null
    }
  }

  async getCriteriaResponses(assessmentId: string): Promise<CriteriaResponse[]> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('category')
        .order('improvement_priority', { ascending: false })

      if (error) {
        console.error('Error fetching criteria responses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCriteriaResponses:', error)
      return []
    }
  }

  async updateCriteriaResponse(id: string, updates: Partial<CriteriaResponse>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fundability_criteria_responses')
        .update({
          ...updates,
          weighted_score: updates.points_earned && updates.weight_factor ? 
            this.calculateWeightedScore(updates.points_earned, updates.weight_factor) : 
            undefined
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating criteria response:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateCriteriaResponse:', error)
      return false
    }
  }

  async getCriteriaResponsesByCategory(assessmentId: string, category: string): Promise<CriteriaResponse[]> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('category', category)
        .order('improvement_priority', { ascending: false })

      if (error) {
        console.error('Error fetching criteria responses by category:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCriteriaResponsesByCategory:', error)
      return []
    }
  }

  async getImprovementOpportunities(assessmentId: string): Promise<CriteriaResponse[]> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('requires_improvement', true)
        .order('improvement_priority', { ascending: false })
        .order('points_possible', { ascending: false })

      if (error) {
        console.error('Error fetching improvement opportunities:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getImprovementOpportunities:', error)
      return []
    }
  }

  async calculateCategoryScore(assessmentId: string, category: string): Promise<{
    score: number,
    maxScore: number,
    percentage: number,
    responseCount: number
  }> {
    try {
      const responses = await this.getCriteriaResponsesByCategory(assessmentId, category)
      
      const score = responses.reduce((sum, r) => sum + r.weighted_score, 0)
      const maxScore = responses.reduce((sum, r) => sum + (r.points_possible * r.weight_factor), 0)
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

      return {
        score,
        maxScore,
        percentage,
        responseCount: responses.length
      }
    } catch (error) {
      console.error('Error calculating category score:', error)
      return { score: 0, maxScore: 0, percentage: 0, responseCount: 0 }
    }
  }

  async generateCategoryRecommendations(assessmentId: string, category: string): Promise<string[]> {
    try {
      const improvements = await this.getCriteriaResponsesByCategory(assessmentId, category)
        .then(responses => responses.filter(r => r.requires_improvement))
        .then(responses => responses.sort((a, b) => b.improvement_priority - a.improvement_priority))

      const recommendations = improvements.slice(0, 5).map(improvement => {
        switch (improvement.criterion_id) {
          case 'has_ein':
            return 'Obtain an EIN (Employer Identification Number) from the IRS'
          case 'has_business_bank':
            return 'Open a dedicated business bank account separate from personal'
          case 'has_business_phone':
            return 'Set up a dedicated business phone line'
          case 'has_website':
            return 'Create a professional business website'
          case 'has_business_address':
            return 'Establish a physical business address (not PO Box)'
          case 'has_duns_number':
            return 'Apply for a DUNS number from Dun & Bradstreet'
          case 'has_business_credit':
            return 'Start building business credit with vendor accounts'
          case 'has_insurance':
            return 'Obtain business liability insurance'
          default:
            return `Improve ${improvement.criterion_name.toLowerCase()}`
        }
      })

      return recommendations
    } catch (error) {
      console.error('Error generating category recommendations:', error)
      return []
    }
  }

  private calculateWeightedScore(pointsEarned: number, weightFactor: number): number {
    return Math.round(pointsEarned * weightFactor * 100) / 100
  }

  async batchSaveCriteriaResponses(responses: Partial<CriteriaResponse>[]): Promise<CriteriaResponse[]> {
    try {
      const formattedResponses = responses.map(response => ({
        assessment_id: response.assessment_id,
        user_id: response.user_id,
        category: response.category,
        criterion_id: response.criterion_id,
        criterion_name: response.criterion_name,
        criterion_description: response.criterion_description,
        response_value: response.response_value,
        response_type: response.response_type,
        points_earned: response.points_earned || 0,
        points_possible: response.points_possible || 0,
        weight_factor: response.weight_factor || 1.0,
        weighted_score: this.calculateWeightedScore(
          response.points_earned || 0,
          response.weight_factor || 1.0
        ),
        is_critical: response.is_critical || false,
        requires_improvement: response.requires_improvement || false,
        improvement_priority: response.improvement_priority || 0
      }))

      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .insert(formattedResponses)
        .select()

      if (error) {
        console.error('Error batch saving criteria responses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in batchSaveCriteriaResponses:', error)
      return []
    }
  }
}

export const criteriaResponseManager = new CriteriaResponseManager()
