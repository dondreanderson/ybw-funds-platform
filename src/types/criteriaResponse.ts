export interface CriterionResponseData {
  category: string;
  criterionId: string;
  criterionName: string;
  description?: string;
  responseValue: any;
  responseType: 'boolean' | 'text' | 'number' | 'select';
  pointsEarned: number;
  pointsPossible: number;
  weightFactor?: number;
  isCritical?: boolean;
}

export interface CriterionResponse {
  id: string;
  assessment_id: string;
  user_id: string;
  category: string;
  criterion_id: string;
  criterion_name: string;
  criterion_description?: string;
  response_value: any;
  response_type: string;
  points_earned: number;
  points_possible: number;
  weight_factor: number;
  weighted_score: number;
  is_critical: boolean;
  requires_improvement: boolean;
  improvement_priority: number;
  answered_at: string;
  created_at: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedCriteria: number;
  totalCriteria: number;
}

export interface OverallScore {
  totalScore: number;
  totalPossible: number;
  percentage: number;
  categoryBreakdown: CategoryScore[];
  completionRate: number;
}