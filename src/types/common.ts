// Common TypeScript interfaces for the YBW Funds platform

export interface User {
  id: string;
  email?: string;
  name?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  business_name?: string;
  business_ein?: string;
  business_phone?: string;
  business_address?: string;
  business_website?: string;
  fundability_score?: number;
  subscription_tier?: string;
  assessment_count?: number;
  last_assessment_date?: string;
}

export interface AssessmentData {
  userId: string;
  businessType: string;
  industry: string;
  yearsInBusiness: number;
  annualRevenue: number;
  creditScore: number;
  responses: Record<string, any>;
  score: number;
  completedAt: string;
}

export interface AssessmentResponse {
  id: string;
  user_id: string;
  business_name?: string;
  criteria_scores: Record<string, any>;
  score: number;
  recommendations: string;
  status: string;
  assessment_data: any;
  created_at: string;
  updated_at: string;
}

export interface AdvancedAssessmentData {
  id: string;
  user_id: string;
  overall_score: number;
  category_scores: Record<string, number>;
  completion_percentage: number;
  recommendations: string[];
  improvement_areas: string[];
  strengths: string[];
  industry_comparison?: any;
  assessment_date: string;
  assessment_version: string;
  status: string;
  metadata: Record<string, any>;
}

export interface CategoryResponse {
  categoryId: string;
  questionId: string;
  response: any;
  score: number;
  maxScore: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FormData {
  businessAge: string;
  businessType: string;
  industry: string;
  revenue: string;
  employees: string;
  creditScore: string;
  cashFlow: string;
  profitability: string;
  debt: string;
  fundingAmount: string;
  fundingPurpose: string;
  timeframe: string;
  collateral: string;
  experience: string;
  businessPlan: string;
  marketPosition: string;
  growth: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'select' | 'boolean' | 'number' | 'text';
  options?: string[];
  required: boolean;
  weight: number;
  maxScore: number;
}

export interface AssessmentCategory {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: AssessmentQuestion[];
}

export interface FundabilityResult {
  score: number;
  grade: string;
  category: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
  percentile?: number;
  industryComparison?: any;
}
