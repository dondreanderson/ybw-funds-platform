import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface BatchResponse {
  criterionId: string
  responseValue: any
  responseType: 'boolean' | 'text' | 'number' | 'select'
  pointsEarned?: number
  maxPoints?: number
}

export interface BatchResponseSubmission {
  assessmentId: string
  userId: string
  responses: BatchResponse[]
  category: string
}

export class BatchResponseService {
  // Save multiple responses in a single transaction
  static async saveBatchResponses(submission: BatchResponseSubmission) {
    try {
      const { assessmentId, userId, responses, category } = submission

      // Prepare responses for database insertion
      const responseRecords = responses.map(response => ({
        assessment_id: assessmentId,
        user_id: userId,
        category: category,
        criterion_id: response.criterionId,
        response_value: response.responseValue,
        response_type: response.responseType,
        points_earned: response.pointsEarned || 0,
        points_possible: response.maxPoints || 0,
        answered_at: new Date().toISOString()
      }))

      // Insert all responses in a batch
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .insert(responseRecords)
        .select()

      if (error) {
        throw new Error(`Failed to save batch responses: ${error.message}`)
      }

      return {
        success: true,
        savedResponses: data?.length || 0,
        data: data
      }
    } catch (error) {
      console.error('Batch response save error:', error)
      throw error
    }
  }

  // Update existing responses in batch
  static async updateBatchResponses(
    assessmentId: string, 
    updates: Array<{criterionId: string, responseValue: any, pointsEarned?: number}>
  ) {
    try {
      const updatePromises = updates.map(update => 
        supabase
          .from('fundability_criteria_responses')
          .update({
            response_value: update.responseValue,
            points_earned: update.pointsEarned || 0,
            answered_at: new Date().toISOString()
          })
          .eq('assessment_id', assessmentId)
          .eq('criterion_id', update.criterionId)
      )

      const results = await Promise.all(updatePromises)
      
      // Check for errors
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        throw new Error(`Failed to update some responses: ${errors[0].error?.message}`)
      }

      return {
        success: true,
        updatedResponses: updates.length
      }
    } catch (error) {
      console.error('Batch response update error:', error)
      throw error
    }
  }

  // Delete responses by assessment and category
  static async deleteCategoryResponses(assessmentId: string, category: string) {
    try {
      const { error } = await supabase
        .from('fundability_criteria_responses')
        .delete()
        .eq('assessment_id', assessmentId)
        .eq('category', category)

      if (error) {
        throw new Error(`Failed to delete category responses: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Delete category responses error:', error)
      throw error
    }
  }

  // Validate batch responses before saving
  static validateBatchResponses(responses: BatchResponse[]): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!Array.isArray(responses) || responses.length === 0) {
      errors.push('Responses array is required and cannot be empty')
    }

    responses.forEach((response, index) => {
      if (!response.criterionId) {
        errors.push(`Response ${index + 1}: criterionId is required`)
      }
      
      if (!response.responseType) {
        errors.push(`Response ${index + 1}: responseType is required`)
      }
      
      if (!['boolean', 'text', 'number', 'select'].includes(response.responseType)) {
        errors.push(`Response ${index + 1}: invalid responseType`)
      }
      
      if (response.responseValue === undefined || response.responseValue === null) {
        errors.push(`Response ${index + 1}: responseValue is required`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}