// src/types/database.ts
export interface FundabilityCriteriaResponse {
  id?: string;
  assessment_id: string;
  user_id: string;
  category: string;
  criterion_id: string;
  criterion_name: string;
  criterion_description?: string | null;
  response_value: any;
  response_type: 'number' | 'boolean' | 'text' | 'select';
  points_earned: number;
  points_possible: number;
  weight_factor?: number | null;
  weighted_score?: number | null;
  is_critical?: boolean;
  requires_improvement?: boolean;
  improvement_priority?: number | null;
  answered_at: string;
  created_at?: string;
}

export interface AdvancedFundabilityAssessment {
  id?: string;
  user_id: string;
  overall_score: number;
  category_scores?: any;
  completion_percentage?: number;
  time_to_complete?: number;
  recommendations?: string[];
  improvement_areas?: string[];
  strengths?: string[];
  industry_comparison?: any;
  created_at?: string;
  updated_at?: string;
  assessment_date?: string;
  assessment_version?: string;
  completion_time_minutes?: number;
  status?: string;
  metadata?: any;
}

// Add other database table interfaces as needed
