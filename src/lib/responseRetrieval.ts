import { createClient } from '@supabase/supabase-js';
import { ErrorHandler } from './errorHandler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ResponseRetrieval {
  async getAssessmentResponses(assessmentId: string): Promise> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('answered_at', { ascending: true });

      if (error) throw error;

      const responseMap = new Map();
      data?.forEach(response => {
        responseMap.set(response.criterion_id, {
          value: response.response_value,
          type: response.response_type,
          points: response.points_earned,
          maxPoints: response.points_possible,
          answeredAt: response.answered_at
        });
      });

      return responseMap;
    } catch (error) {
      throw ErrorHandler.createError('RESPONSE_RETRIEVAL_ERROR', error);
    }
  }

  async getUserAssessmentHistory(userId: string, limit: number = 10): Promise {
    try {
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .select(`
          id,
          overall_score,
          completion_percentage,
          created_at,
          assessment_date,
          assessment_version
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw ErrorHandler.createError('HISTORY_RETRIEVAL_ERROR', error);
    }
  }

  async getCategoryResponses(
    assessmentId: string, 
    category: string
  ): Promise> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select(`
          criterion_id,
          response_value,
          response_type,
          points_earned,
          points_possible,
          fundability_criteria!inner(category)
        `)
        .eq('assessment_id', assessmentId)
        .eq('fundability_criteria.category', category);

      if (error) throw error;

      const responseMap = new Map();
      data?.forEach(response => {
        responseMap.set(response.criterion_id, {
          value: response.response_value,
          type: response.response_type,
          points: response.points_earned,
          maxPoints: response.points_possible
        });
      });

      return responseMap;
    } catch (error) {
      throw ErrorHandler.createError('CATEGORY_RETRIEVAL_ERROR', error);
    }
  }
}