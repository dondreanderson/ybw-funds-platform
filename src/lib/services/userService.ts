import { supabase } from '@/lib/supabase';
import type { UserProfile, BusinessProfile, DatabaseResponse } from '@/lib/types/core';

export class UserService {
  // Get current user profile with business information
  static async getCurrentUserProfile(): Promise<DatabaseResponse<UserProfile & { business_profile?: BusinessProfile }>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { data: null, error: new Error('No authenticated user') };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          business_profiles (*)
        `)
        .eq('id', user.id)
        .single();

      if (data && data.business_profiles && Array.isArray(data.business_profiles)) {
        return {
          data: {
            ...data,
            business_profile: data.business_profiles[0] || null
          },
          error: null
        };
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Create or update business profile
  static async upsertBusinessProfile(
    userId: string,
    profileData: Partial<BusinessProfile>
  ): Promise<DatabaseResponse<BusinessProfile>> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Update fundability score
  static async updateFundabilityScore(
    userId: string,
    score: number
  ): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          fundability_score: score,
          last_assessment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Increment assessment count
  static async incrementAssessmentCount(userId: string): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase.rpc('increment_assessment_count', {
        user_id: userId
      });

      if (error) {
        // Fallback: manually increment
        const { data: profile } = await this.getUserProfile(userId);
        if (profile) {
          return await this.updateUserProfile(userId, {
            assessment_count: (profile.assessment_count || 0) + 1
          });
        }
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
