import { supabase } from '@/lib/supabase';

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export class DatabaseService {
  // User Profile Operations
  static async getUserProfile(userId: string): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          business_profiles (*)
        `)
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Assessment Operations
  static async createAdvancedAssessment(assessmentData: {
    user_id: string;
    overall_score: number;
    category_scores?: any;
    completion_percentage?: number;
    status?: string;
  }): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .insert({
          ...assessmentData,
          assessment_version: '2.0',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Score History Operations
  static async saveScoreHistory(scoreData: {
    user_id: string;
    assessment_id: string;
    overall_score: number;
    category_scores?: any;
    assessment_date: string;
  }): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('score_history')
        .insert({
          ...scoreData,
          score_change: 0, // We'll calculate this later
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Test connection method
  static async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }
}
