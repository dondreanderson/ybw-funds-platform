// Core type definitions for the entire platform
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  business_name?: string;
  fundability_score?: number;
  subscription_tier?: string;
  last_assessment_date?: string;
  assessment_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_structure?: string;
  industry?: string;
  years_in_business?: number;
  annual_revenue?: number;
  employees_count?: number;
  has_ein?: boolean;
  has_business_address?: boolean;
  has_business_phone?: boolean;
  has_business_website?: boolean;
  has_business_email?: boolean;
  has_duns_number?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  overall_score: number;
  category_scores?: Record<string, number>;
  completion_percentage?: number;
  time_to_complete?: number;
  recommendations?: string[];
  improvement_areas?: string[];
  strengths?: string[];
  status?: string;
  assessment_version?: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResponse {
  category: string;
  criterionId: string;
  criterionName: string;
  responseValue: any;
  responseType: 'boolean' | 'text' | 'number' | 'select';
  pointsEarned: number;
  pointsPossible: number;
  weightFactor?: number;
  isCritical?: boolean;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
  weightedScore: number;
  completedCriteria: number;
  totalCriteria: number;
}

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
