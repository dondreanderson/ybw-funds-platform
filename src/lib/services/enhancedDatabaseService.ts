import { supabase } from '@/lib/supabase';
import type { Assessment, DatabaseResponse } from '@/lib/types/core';

export class EnhancedDatabaseService {
  // Get assessment history with pagination
  static async getAssessmentHistory(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<DatabaseResponse<Assessment[]>> {
    try {
      const { limit = 10, offset = 0 } = options;
      
      const { data, error, count } = await supabase
        .from('advanced_fundability_assessments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data, error, count: count || 0 };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Get latest assessment
  static async getLatestAssessment(userId: string): Promise<DatabaseResponse<Assessment>> {
    try {
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Get score trend data
  static async getScoreTrend(
    userId: string,
    days: number = 30
  ): Promise<DatabaseResponse<any[]>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .eq('user_id', userId)
        .gte('assessment_date', cutoffDate.toISOString().split('T')[0])
        .order('assessment_date', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Get assessment recommendations
  static async getAssessmentRecommendations(assessmentId: string): Promise<DatabaseResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('assessment_recommendations')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('priority', { ascending: false })
        .order('estimated_impact_points', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Health check with detailed connection info
  static async detailedHealthCheck(): Promise<{
    connected: boolean;
    tablesAccessible: string[];
    errors: string[];
  }> {
    const result = {
      connected: false,
      tablesAccessible: [] as string[],
      errors: [] as string[]
    };

    const tablesToCheck = [
      'users',
      'user_profiles', 
      'advanced_fundability_assessments',
      'score_history',
      'business_profiles'
    ];

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (!error) {
          result.tablesAccessible.push(table);
        } else {
          result.errors.push(`${table}: ${error.message}`);
        }
      } catch (error) {
        result.errors.push(`${table}: ${error}`);
      }
    }

    result.connected = result.tablesAccessible.length > 0;
    return result;
  }
}
