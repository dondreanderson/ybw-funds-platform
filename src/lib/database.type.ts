export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          business_name: string | null
          business_ein: string | null
          business_address: string | null
          business_phone: string | null
          business_website: string | null
          fundability_score: number | null
          role: string | null
          created_at: string
          updated_at: string
          subscription_tier: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          business_name?: string | null
          business_ein?: string | null
          business_address?: string | null
          business_phone?: string | null
          business_website?: string | null
          fundability_score?: number | null
          role?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          business_name?: string | null
          business_ein?: string | null
          business_address?: string | null
          business_phone?: string | null
          business_website?: string | null
          fundability_score?: number | null
          role?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: string | null
        }
      }
      advanced_fundability_assessments: {
        Row: {
          id: string
          user_id: string | null
          overall_score: number
          category_scores: Json
          completion_percentage: number | null
          time_to_complete: number | null
          recommendations: string[] | null
          improvement_areas: string[] | null
          strengths: string[] | null
          industry_comparison: Json | null
          created_at: string | null
          updated_at: string | null
          assessment_date: string | null
          assessment_version: string | null
          completion_time_minutes: number | null
          status: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          overall_score: number
          category_scores: Json
          completion_percentage?: number | null
          time_to_complete?: number | null
          recommendations?: string[] | null
          improvement_areas?: string[] | null
          strengths?: string[] | null
          industry_comparison?: Json | null
          created_at?: string | null
          updated_at?: string | null
          assessment_date?: string | null
          assessment_version?: string | null
          completion_time_minutes?: number | null
          status?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          overall_score?: number
          category_scores?: Json
          completion_percentage?: number | null
          time_to_complete?: number | null
          recommendations?: string[] | null
          improvement_areas?: string[] | null
          strengths?: string[] | null
          industry_comparison?: Json | null
          created_at?: string | null
          updated_at?: string | null
          assessment_date?: string | null
          assessment_version?: string | null
          completion_time_minutes?: number | null
          status?: string | null
          metadata?: Json | null
        }
      }
      category_performances: {
        Row: {
          id: string
          assessment_id: string | null
          category_id: string
          category_name: string
          score: number
          max_score: number
          completed_criteria: number
          total_criteria: number
          answers: Json
          recommendations: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          assessment_id?: string | null
          category_id: string
          category_name: string
          score: number
          max_score: number
          completed_criteria: number
          total_criteria: number
          answers: Json
          recommendations?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          assessment_id?: string | null
          category_id?: string
          category_name?: string
          score?: number
          max_score?: number
          completed_criteria?: number
          total_criteria?: number
          answers?: Json
          recommendations?: string[] | null
          created_at?: string | null
        }
      }
      score_history: {
        Row: {
          id: string
          user_id: string | null
          assessment_id: string | null
          overall_score: number
          category_scores: Json
          assessment_date: string
          score_change: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          assessment_id?: string | null
          overall_score: number
          category_scores: Json
          assessment_date: string
          score_change?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          assessment_id?: string | null
          overall_score?: number
          category_scores?: Json
          assessment_date?: string
          score_change?: number | null
          created_at?: string | null
        }
      }
      assessment_analytics: {
        Row: {
          id: string
          user_id: string | null
          assessment_date: string
          overall_score: number
          improvement_from_last: number | null
          industry_percentile: number | null
          time_spent_minutes: number | null
          categories_completed: number | null
          total_categories: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          assessment_date: string
          overall_score: number
          improvement_from_last?: number | null
          industry_percentile?: number | null
          time_spent_minutes?: number | null
          categories_completed?: number | null
          total_categories?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          assessment_date?: string
          overall_score?: number
          improvement_from_last?: number | null
          industry_percentile?: number | null
          time_spent_minutes?: number | null
          categories_completed?: number | null
          total_categories?: number | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
