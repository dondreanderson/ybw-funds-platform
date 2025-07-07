// src/lib/batchResponseService.ts
import { createClient } from '@/lib/supabase';
import type { FundabilityCriteriaResponse } from '@/types/database';

export interface BatchResponseInput {
  assessmentId: string;
  userId: string;
  responses: Array<{
    category: string;
    criterionId: string;
    criterionName: string;
    criterionDescription?: string;
    responseValue: any;
    responseType: 'number' | 'boolean' | 'text' | 'select';
    pointsEarned: number;
    pointsPossible: number;
    weightFactor?: number;
    isCritical?: boolean;
  }>;
}

export class BatchResponseService {
  private supabase = createClient;

  async submitBatchResponses(batchData: BatchResponseInput) {
    try {
      const { assessmentId, userId, responses } = batchData;
      
      // Prepare responses for database insertion
      const responseRecords: Omit<FundabilityCriteriaResponse, 'id' | 'created_at'>[] = responses.map(response => ({
        assessment_id: assessmentId,
        user_id: userId,
        category: response.category,
        criterion_id: response.criterionId,
        criterion_name: response.criterionName,
        criterion_description: response.criterionDescription || null,
        response_value: response.responseValue,
        response_type: response.responseType,
        points_earned: response.pointsEarned,
        points_possible: response.pointsPossible,
        weight_factor: response.weightFactor || 1.0,
        weighted_score: (response.pointsEarned * (response.weightFactor || 1.0)),
        is_critical: response.isCritical || false,
        requires_improvement: response.pointsEarned < response.pointsPossible,
        improvement_priority: response.isCritical && response.pointsEarned < response.pointsPossible ? 1 : null,
        answered_at: new Date().toISOString()
      }));

      // Insert responses into database
      const { data, error } = await this.supabase
        .from('fundability_criteria_responses')
        .insert(responseRecords)
        .select();

      if (error) {
        console.error('Error inserting batch responses:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Batch response service error:', error);
      throw error;
    }
  }

  async getBatchResponses(assessmentId: string) {
    try {
      const { data, error } = await this.supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching batch responses:', error);
      throw error;
    }
  }
}

export const batchResponseService = new BatchResponseService();
