export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advanced_fundability_assessments: {
        Row: {
          assessment_date: string | null
          assessment_version: string | null
          category_scores: Json
          completion_percentage: number | null
          completion_time_minutes: number | null
          created_at: string | null
          id: string
          improvement_areas: string[] | null
          industry_comparison: Json | null
          metadata: Json | null
          overall_score: number
          recommendations: string[] | null
          status: string | null
          strengths: string[] | null
          time_to_complete: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          assessment_version?: string | null
          category_scores: Json
          completion_percentage?: number | null
          completion_time_minutes?: number | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          industry_comparison?: Json | null
          metadata?: Json | null
          overall_score: number
          recommendations?: string[] | null
          status?: string | null
          strengths?: string[] | null
          time_to_complete?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          assessment_version?: string | null
          category_scores?: Json
          completion_percentage?: number | null
          completion_time_minutes?: number | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          industry_comparison?: Json | null
          metadata?: Json | null
          overall_score?: number
          recommendations?: string[] | null
          status?: string | null
          strengths?: string[] | null
          time_to_complete?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assessment_analytics: {
        Row: {
          assessment_date: string
          categories_completed: number | null
          created_at: string | null
          id: string
          improvement_from_last: number | null
          industry_percentile: number | null
          overall_score: number
          time_spent_minutes: number | null
          total_categories: number | null
          user_id: string | null
        }
        Insert: {
          assessment_date: string
          categories_completed?: number | null
          created_at?: string | null
          id?: string
          improvement_from_last?: number | null
          industry_percentile?: number | null
          overall_score: number
          time_spent_minutes?: number | null
          total_categories?: number | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string
          categories_completed?: number | null
          created_at?: string | null
          id?: string
          improvement_from_last?: number | null
          industry_percentile?: number | null
          overall_score?: number
          time_spent_minutes?: number | null
          total_categories?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      assessment_recommendations: {
        Row: {
          action_items: string[] | null
          assessment_id: string | null
          category_id: string | null
          created_at: string | null
          description: string
          estimated_impact_points: number | null
          estimated_timeframe: string | null
          id: string
          priority: string
          recommendation_type: string
          resources: Json | null
          title: string
        }
        Insert: {
          action_items?: string[] | null
          assessment_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          estimated_impact_points?: number | null
          estimated_timeframe?: string | null
          id?: string
          priority: string
          recommendation_type: string
          resources?: Json | null
          title: string
        }
        Update: {
          action_items?: string[] | null
          assessment_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          estimated_impact_points?: number | null
          estimated_timeframe?: string | null
          id?: string
          priority?: string
          recommendation_type?: string
          resources?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_recommendations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "advanced_fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_reports: {
        Row: {
          assessment_id: string | null
          download_count: number | null
          file_path: string | null
          file_size: number | null
          generated_at: string | null
          id: string
          last_downloaded: string | null
          report_type: string
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          download_count?: number | null
          file_path?: string | null
          file_size?: number | null
          generated_at?: string | null
          id?: string
          last_downloaded?: string | null
          report_type: string
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          download_count?: number | null
          file_path?: string | null
          file_size?: number | null
          generated_at?: string | null
          id?: string
          last_downloaded?: string | null
          report_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "advanced_fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          annual_revenue: number | null
          business_structure: string | null
          created_at: string | null
          employees_count: number | null
          has_business_address: boolean | null
          has_business_email: boolean | null
          has_business_phone: boolean | null
          has_business_website: boolean | null
          has_duns_number: boolean | null
          has_ein: boolean | null
          id: string
          industry: string | null
          updated_at: string | null
          user_id: string | null
          years_in_business: number | null
        }
        Insert: {
          annual_revenue?: number | null
          business_structure?: string | null
          created_at?: string | null
          employees_count?: number | null
          has_business_address?: boolean | null
          has_business_email?: boolean | null
          has_business_phone?: boolean | null
          has_business_website?: boolean | null
          has_duns_number?: boolean | null
          has_ein?: boolean | null
          id?: string
          industry?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_in_business?: number | null
        }
        Update: {
          annual_revenue?: number | null
          business_structure?: string | null
          created_at?: string | null
          employees_count?: number | null
          has_business_address?: boolean | null
          has_business_email?: boolean | null
          has_business_phone?: boolean | null
          has_business_website?: boolean | null
          has_duns_number?: boolean | null
          has_ein?: boolean | null
          id?: string
          industry?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      category_assessments: {
        Row: {
          assessment_id: string | null
          category_id: string
          category_name: string
          completion_percentage: number
          created_at: string | null
          id: string
          max_score: number
          score: number
          weight: number
        }
        Insert: {
          assessment_id?: string | null
          category_id: string
          category_name: string
          completion_percentage: number
          created_at?: string | null
          id?: string
          max_score: number
          score: number
          weight: number
        }
        Update: {
          assessment_id?: string | null
          category_id?: string
          category_name?: string
          completion_percentage?: number
          created_at?: string | null
          id?: string
          max_score?: number
          score?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_assessments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "advanced_fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      category_performances: {
        Row: {
          answers: Json
          assessment_id: string | null
          category_id: string
          category_name: string
          completed_criteria: number
          created_at: string | null
          id: string
          max_score: number
          recommendations: string[] | null
          score: number
          total_criteria: number
        }
        Insert: {
          answers: Json
          assessment_id?: string | null
          category_id: string
          category_name: string
          completed_criteria: number
          created_at?: string | null
          id?: string
          max_score: number
          recommendations?: string[] | null
          score: number
          total_criteria: number
        }
        Update: {
          answers?: Json
          assessment_id?: string | null
          category_id?: string
          category_name?: string
          completed_criteria?: number
          created_at?: string | null
          id?: string
          max_score?: number
          recommendations?: string[] | null
          score?: number
          total_criteria?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_performances_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "advanced_fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          coach_email: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          session_date: string
          session_type: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          coach_email?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          session_date: string
          session_type?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          coach_email?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          session_date?: string
          session_type?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_reports: {
        Row: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          created_at: string | null
          id: string
          report_data: Json | null
          report_date: string | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          bureau: Database["public"]["Enums"]["credit_bureau"]
          created_at?: string | null
          id?: string
          report_data?: Json | null
          report_date?: string | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          bureau?: Database["public"]["Enums"]["credit_bureau"]
          created_at?: string | null
          id?: string
          report_data?: Json | null
          report_date?: string | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      criteria_responses: {
        Row: {
          answer_type: string
          answer_value: string | null
          assessment_id: string | null
          category_id: string
          created_at: string | null
          criterion_id: string
          id: string
          max_points: number | null
          points_earned: number | null
          question: string
        }
        Insert: {
          answer_type: string
          answer_value?: string | null
          assessment_id?: string | null
          category_id: string
          created_at?: string | null
          criterion_id: string
          id?: string
          max_points?: number | null
          points_earned?: number | null
          question: string
        }
        Update: {
          answer_type?: string
          answer_value?: string | null
          assessment_id?: string | null
          category_id?: string
          created_at?: string | null
          criterion_id?: string
          id?: string
          max_points?: number | null
          points_earned?: number | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "criteria_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "advanced_fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      fundability_assessments: {
        Row: {
          assessment_data: Json | null
          business_name: string
          created_at: string | null
          criteria_scores: Json
          id: string
          recommendations: string
          score: number
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_data?: Json | null
          business_name: string
          created_at?: string | null
          criteria_scores: Json
          id?: string
          recommendations: string
          score: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_data?: Json | null
          business_name?: string
          created_at?: string | null
          criteria_scores?: Json
          id?: string
          recommendations?: string
          score?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fundability_assessments_advanced: {
        Row: {
          annual_revenue: number | null
          assessment_type: string | null
          business_age_months: number | null
          business_registration_score: number | null
          business_type: string | null
          categories_completed: Json | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          credit_profile_score: number | null
          criteria_scores: Json
          employee_count: number | null
          financial_documentation_score: number | null
          id: string
          improvement_plan: Json | null
          industry: string | null
          ip_address: unknown | null
          max_possible_score: number | null
          online_presence_score: number | null
          operational_infrastructure_score: number | null
          percentage_score: number | null
          recommendations: string[] | null
          responses: Json
          risk_compliance_score: number | null
          started_at: string | null
          time_to_complete_minutes: number | null
          total_score: number
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          annual_revenue?: number | null
          assessment_type?: string | null
          business_age_months?: number | null
          business_registration_score?: number | null
          business_type?: string | null
          categories_completed?: Json | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          credit_profile_score?: number | null
          criteria_scores: Json
          employee_count?: number | null
          financial_documentation_score?: number | null
          id?: string
          improvement_plan?: Json | null
          industry?: string | null
          ip_address?: unknown | null
          max_possible_score?: number | null
          online_presence_score?: number | null
          operational_infrastructure_score?: number | null
          percentage_score?: number | null
          recommendations?: string[] | null
          responses: Json
          risk_compliance_score?: number | null
          started_at?: string | null
          time_to_complete_minutes?: number | null
          total_score: number
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          annual_revenue?: number | null
          assessment_type?: string | null
          business_age_months?: number | null
          business_registration_score?: number | null
          business_type?: string | null
          categories_completed?: Json | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          credit_profile_score?: number | null
          criteria_scores?: Json
          employee_count?: number | null
          financial_documentation_score?: number | null
          id?: string
          improvement_plan?: Json | null
          industry?: string | null
          ip_address?: unknown | null
          max_possible_score?: number | null
          online_presence_score?: number | null
          operational_infrastructure_score?: number | null
          percentage_score?: number | null
          recommendations?: string[] | null
          responses?: Json
          risk_compliance_score?: number | null
          started_at?: string | null
          time_to_complete_minutes?: number | null
          total_score?: number
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fundability_criteria: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          name: string
          options: Json | null
          required: boolean
          type: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id: string
          name: string
          options?: Json | null
          required?: boolean
          type: string
          updated_at?: string | null
          weight?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          options?: Json | null
          required?: boolean
          type?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: []
      }
      fundability_criteria_history: {
        Row: {
          assessment_id: string | null
          changed_at: string | null
          changed_by: string | null
          criteria_category: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          assessment_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          criteria_category: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          assessment_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          criteria_category?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fundability_criteria_history_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      fundability_criteria_responses: {
        Row: {
          answered_at: string | null
          assessment_id: string | null
          category: string
          created_at: string | null
          criterion_description: string | null
          criterion_id: string
          criterion_name: string
          id: string
          improvement_priority: number | null
          is_critical: boolean | null
          points_earned: number | null
          points_possible: number
          requires_improvement: boolean | null
          response_type: string
          response_value: Json
          user_id: string | null
          weight_factor: number | null
          weighted_score: number | null
        }
        Insert: {
          answered_at?: string | null
          assessment_id?: string | null
          category: string
          created_at?: string | null
          criterion_description?: string | null
          criterion_id: string
          criterion_name: string
          id?: string
          improvement_priority?: number | null
          is_critical?: boolean | null
          points_earned?: number | null
          points_possible: number
          requires_improvement?: boolean | null
          response_type: string
          response_value: Json
          user_id?: string | null
          weight_factor?: number | null
          weighted_score?: number | null
        }
        Update: {
          answered_at?: string | null
          assessment_id?: string | null
          category?: string
          created_at?: string | null
          criterion_description?: string | null
          criterion_id?: string
          criterion_name?: string
          id?: string
          improvement_priority?: number | null
          is_critical?: boolean | null
          points_earned?: number | null
          points_possible?: number
          requires_improvement?: boolean | null
          response_type?: string
          response_value?: Json
          user_id?: string | null
          weight_factor?: number | null
          weighted_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fundability_criteria_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "fundability_assessments_advanced"
            referencedColumns: ["id"]
          },
        ]
      }
      fundability_recommendations_tracking: {
        Row: {
          assessment_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          recommendation_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recommendation_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recommendation_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fundability_recommendations_tracking_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      fundability_reports: {
        Row: {
          access_token: string | null
          assessment_id: string | null
          charts_data: Json | null
          created_at: string | null
          downloaded_at: string | null
          executive_summary: string | null
          expires_at: string | null
          file_format: string | null
          file_path: string | null
          file_size_bytes: number | null
          generated_at: string | null
          id: string
          is_public: boolean | null
          recommendations_data: Json | null
          report_data: Json
          report_type: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          assessment_id?: string | null
          charts_data?: Json | null
          created_at?: string | null
          downloaded_at?: string | null
          executive_summary?: string | null
          expires_at?: string | null
          file_format?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          generated_at?: string | null
          id?: string
          is_public?: boolean | null
          recommendations_data?: Json | null
          report_data: Json
          report_type?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          assessment_id?: string | null
          charts_data?: Json | null
          created_at?: string | null
          downloaded_at?: string | null
          executive_summary?: string | null
          expires_at?: string | null
          file_format?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          generated_at?: string | null
          id?: string
          is_public?: boolean | null
          recommendations_data?: Json | null
          report_data?: Json
          report_type?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fundability_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "fundability_assessments_advanced"
            referencedColumns: ["id"]
          },
        ]
      }
      fundability_scores: {
        Row: {
          created_at: string | null
          credit_profile_score: number | null
          criteria_details: Json | null
          entity_setup_score: number | null
          financial_profile_score: number | null
          id: string
          online_presence_score: number | null
          overall_score: number
          recommendations: string[] | null
          scan_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_profile_score?: number | null
          criteria_details?: Json | null
          entity_setup_score?: number | null
          financial_profile_score?: number | null
          id?: string
          online_presence_score?: number | null
          overall_score: number
          recommendations?: string[] | null
          scan_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_profile_score?: number | null
          criteria_details?: Json | null
          entity_setup_score?: number | null
          financial_profile_score?: number | null
          id?: string
          online_presence_score?: number | null
          overall_score?: number
          recommendations?: string[] | null
          scan_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fundability_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_opportunities: {
        Row: {
          application_url: string | null
          created_at: string | null
          description: string | null
          id: string
          industry_restrictions: string[] | null
          interest_rate_max: number | null
          interest_rate_min: number | null
          is_active: boolean | null
          lender_name: string
          max_loan_amount: number | null
          min_credit_score: number | null
          min_loan_amount: number | null
          minimum_annual_revenue: number | null
          minimum_time_in_business: number | null
          product_type: string
          reports_to_bureaus: boolean | null
          requires_personal_guarantee: boolean | null
          term_months_max: number | null
          term_months_min: number | null
          updated_at: string | null
        }
        Insert: {
          application_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry_restrictions?: string[] | null
          interest_rate_max?: number | null
          interest_rate_min?: number | null
          is_active?: boolean | null
          lender_name: string
          max_loan_amount?: number | null
          min_credit_score?: number | null
          min_loan_amount?: number | null
          minimum_annual_revenue?: number | null
          minimum_time_in_business?: number | null
          product_type: string
          reports_to_bureaus?: boolean | null
          requires_personal_guarantee?: boolean | null
          term_months_max?: number | null
          term_months_min?: number | null
          updated_at?: string | null
        }
        Update: {
          application_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry_restrictions?: string[] | null
          interest_rate_max?: number | null
          interest_rate_min?: number | null
          is_active?: boolean | null
          lender_name?: string
          max_loan_amount?: number | null
          min_credit_score?: number | null
          min_loan_amount?: number | null
          minimum_annual_revenue?: number | null
          minimum_time_in_business?: number | null
          product_type?: string
          reports_to_bureaus?: boolean | null
          requires_personal_guarantee?: boolean | null
          term_months_max?: number | null
          term_months_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      industry_benchmarks: {
        Row: {
          avg_business_registration: number | null
          avg_credit_profile: number | null
          avg_financial_documentation: number | null
          avg_online_presence: number | null
          avg_operational_infrastructure: number | null
          avg_risk_compliance: number | null
          avg_total_score: number | null
          business_size: string | null
          created_at: string | null
          data_source: string | null
          id: string
          industry_code: string | null
          industry_name: string
          last_updated: string | null
          percentile_25: number | null
          percentile_50: number | null
          percentile_75: number | null
          percentile_90: number | null
          sample_size: number | null
        }
        Insert: {
          avg_business_registration?: number | null
          avg_credit_profile?: number | null
          avg_financial_documentation?: number | null
          avg_online_presence?: number | null
          avg_operational_infrastructure?: number | null
          avg_risk_compliance?: number | null
          avg_total_score?: number | null
          business_size?: string | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          industry_code?: string | null
          industry_name: string
          last_updated?: string | null
          percentile_25?: number | null
          percentile_50?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          sample_size?: number | null
        }
        Update: {
          avg_business_registration?: number | null
          avg_credit_profile?: number | null
          avg_financial_documentation?: number | null
          avg_online_presence?: number | null
          avg_operational_infrastructure?: number | null
          avg_risk_compliance?: number | null
          avg_total_score?: number | null
          business_size?: string | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          industry_code?: string | null
          industry_name?: string
          last_updated?: string | null
          percentile_25?: number | null
          percentile_50?: number | null
          percentile_75?: number | null
          percentile_90?: number | null
          sample_size?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          annual_revenue: number | null
          business_address: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          business_type: string | null
          business_website: string | null
          created_at: string | null
          duns_number: string | null
          ein: string | null
          employees: number | null
          founded_year: number | null
          fundability_score: number | null
          id: string
          industry: string | null
          last_assessment_date: string | null
          updated_at: string | null
        }
        Insert: {
          annual_revenue?: number | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          business_website?: string | null
          created_at?: string | null
          duns_number?: string | null
          ein?: string | null
          employees?: number | null
          founded_year?: number | null
          fundability_score?: number | null
          id: string
          industry?: string | null
          last_assessment_date?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_revenue?: number | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          business_website?: string | null
          created_at?: string | null
          duns_number?: string | null
          ein?: string | null
          employees?: number | null
          founded_year?: number | null
          fundability_score?: number | null
          id?: string
          industry?: string | null
          last_assessment_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      question_responses: {
        Row: {
          category_assessment_id: string | null
          created_at: string | null
          id: string
          points_earned: number
          question_id: string
          question_text: string
          question_weight: number
          response_type: string
          response_value: string | null
        }
        Insert: {
          category_assessment_id?: string | null
          created_at?: string | null
          id?: string
          points_earned: number
          question_id: string
          question_text: string
          question_weight: number
          response_type: string
          response_value?: string | null
        }
        Update: {
          category_assessment_id?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number
          question_id?: string
          question_text?: string
          question_weight?: number
          response_type?: string
          response_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_category_assessment_id_fkey"
            columns: ["category_assessment_id"]
            isOneToOne: false
            referencedRelation: "category_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      score_history: {
        Row: {
          assessment_date: string
          assessment_id: string | null
          category_scores: Json
          created_at: string | null
          id: string
          overall_score: number
          score_change: number | null
          user_id: string | null
        }
        Insert: {
          assessment_date: string
          assessment_id?: string | null
          category_scores: Json
          created_at?: string | null
          id?: string
          overall_score: number
          score_change?: number | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string
          assessment_id?: string | null
          category_scores?: Json
          created_at?: string | null
          id?: string
          overall_score?: number
          score_change?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_history_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "advanced_fundability_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          status: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_funding_matches: {
        Row: {
          application_status: string | null
          applied_at: string | null
          created_at: string | null
          funding_opportunity_id: string | null
          id: string
          is_prequalified: boolean | null
          match_score: number
          user_id: string | null
        }
        Insert: {
          application_status?: string | null
          applied_at?: string | null
          created_at?: string | null
          funding_opportunity_id?: string | null
          id?: string
          is_prequalified?: boolean | null
          match_score: number
          user_id?: string | null
        }
        Update: {
          application_status?: string | null
          applied_at?: string | null
          created_at?: string | null
          funding_opportunity_id?: string | null
          id?: string
          is_prequalified?: boolean | null
          match_score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_funding_matches_funding_opportunity_id_fkey"
            columns: ["funding_opportunity_id"]
            isOneToOne: false
            referencedRelation: "funding_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_funding_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          assessment_count: number | null
          business_address: string | null
          business_ein: string | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          created_at: string | null
          email: string | null
          fundability_score: number | null
          id: string
          last_assessment_date: string | null
          name: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_count?: number | null
          business_address?: string | null
          business_ein?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string | null
          email?: string | null
          fundability_score?: number | null
          id: string
          last_assessment_date?: string | null
          name?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_count?: number | null
          business_address?: string | null
          business_ein?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string | null
          email?: string | null
          fundability_score?: number | null
          id?: string
          last_assessment_date?: string | null
          name?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          business_address: string | null
          business_ein: string | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          created_at: string | null
          email: string
          fundability_score: number | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          business_address?: string | null
          business_ein?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string | null
          email: string
          fundability_score?: number | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          business_address?: string | null
          business_ein?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string | null
          email?: string
          fundability_score?: number | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      credit_bureau: "dun_bradstreet" | "experian" | "equifax"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type: "credit" | "debit" | "funding" | "fee"
      user_role: "admin" | "user" | "demo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      credit_bureau: ["dun_bradstreet", "experian", "equifax"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: ["credit", "debit", "funding", "fee"],
      user_role: ["admin", "user", "demo"],
    },
  },
} as const
