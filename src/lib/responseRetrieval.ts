import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ResponseData {
  criterion_id: string;
  response_value: any;
  points_earned: number;
  points_possible: number;
  answered_at: string;
}

interface AssessmentHistory {
  id: string;
  overall_score: number;
  assessment_date: string;
  status: string;
}

export class ResponseRetrievalService {
  async getAssessmentResponses(assessmentId: string): Promise<Map<string, ResponseData>> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('answered_at', { ascending: true });

      if (error) throw error;

      const responseMap = new Map<string, ResponseData>();
      data?.forEach(response => {
        responseMap.set(response.criterion_id, {
          criterion_id: response.criterion_id,
          response_value: response.response_value,
          points_earned: response.points_earned,
          points_possible: response.points_possible,
          answered_at: response.answered_at
        });
      });

      return responseMap;
    } catch (error) {
      console.error('Error retrieving assessment responses:', error);
      throw error;
    }
  }

  async getUserAssessmentHistory(userId: string, limit: number = 10): Promise<AssessmentHistory[]> {
    try {
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .select(`
          id,
          overall_score,
          assessment_date,
          status
        `)
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(assessment => ({
        id: assessment.id,
        overall_score: assessment.overall_score,
        assessment_date: assessment.assessment_date,
        status: assessment.status
      })) || [];
    } catch (error) {
      console.error('Error retrieving user assessment history:', error);
      throw error;
    }
  }

  async getCategoryResponses(
    assessmentId: string,
    category: string
  ): Promise<Map<string, ResponseData>> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select(`
          *,
          fundability_criteria (
            category,
            name,
            description
          )
        `)
        .eq('assessment_id', assessmentId)
        .eq('fundability_criteria.category', category);

      if (error) throw error;

      const responseMap = new Map<string, ResponseData>();
      data?.forEach(response => {
        responseMap.set(response.criterion_id, {
          criterion_id: response.criterion_id,
          response_value: response.response_value,
          points_earned: response.points_earned,
          points_possible: response.points_possible,
          answered_at: response.answered_at
        });
      });

      return responseMap;
    } catch (error) {
      console.error('Error retrieving category responses:', error);
      throw error;
    }
  }

  async getResponseStatistics(userId: string): Promise<{
    totalResponses: number;
    averageScore: number;
    completionRate: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('points_earned, points_possible')
        .eq('user_id', userId);

      if (error) throw error;

      const totalResponses = data?.length || 0;
      let totalEarned = 0;
      let totalPossible = 0;

      data?.forEach(response => {
        totalEarned += response.points_earned || 0;
        totalPossible += response.points_possible || 0;
      });

      const averageScore = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
      const completionRate = totalResponses > 0 ? 100 : 0; // Simplified completion rate

      return {
        totalResponses,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate
      };
    } catch (error) {
      console.error('Error retrieving response statistics:', error);
      return {
        totalResponses: 0,
        averageScore: 0,
        completionRate: 0
      };
    }
  }
}

export default ResponseRetrievalService;
