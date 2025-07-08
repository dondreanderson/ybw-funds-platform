import { supabase } from '@/lib/supabase';
import type { UserProfile, DatabaseResponse } from '@/lib/types/core';

export class UserService {
  static async getCurrentUserProfile(): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: new Error('Not authenticated') };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async updateFundabilityScore(userId: string, score: number): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          fundability_score: score,
          last_assessment_date: new Date().toISOString()
        })
        .eq('id', userId);

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async incrementAssessmentCount(userId: string): Promise<DatabaseResponse<any>> {
    try {
      // Get current count
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('assessment_count')
        .eq('id', userId)
        .single();

      const newCount = (profile?.assessment_count || 0) + 1;

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ assessment_count: newCount })
        .eq('id', userId);

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}