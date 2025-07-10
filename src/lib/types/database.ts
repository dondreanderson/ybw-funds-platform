// Database types
export interface Assessment {
  id: string
  user_id: string
  overall_score: number
  assessment_date: string
  assessment_version: string
  completion_time_minutes?: number
  status: string
  metadata?: any
  created_at?: string
  updated_at?: string
}

export interface CategoryAssessment {
  id: string
  assessment_id: string
  category_id: string
  category_name: string
  score: number
  max_score: number
  weight: number
  completion_percentage: number
  created_at?: string
}

export interface AssessmentRecommendation {
  id: string
  assessment_id: string
  category_id?: string
  recommendation_type: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimated_impact_points?: number
  estimated_timeframe?: string
  action_items?: string[]
  resources?: any
  created_at?: string
}

// AI Assessment types
export interface AIAssessmentResult {
  overallScore: number
  categoryScores: {
    businessFoundation: number
    financial: number
    digitalPresence: number
    banking: number
    industry: number
  }
  riskLevel: 'low' | 'medium' | 'high'
  fundingPotential: {
    maxAmount: number
    recommendedProducts: string[]
    timeToFunding: number
  }
  recommendations: Recommendation[]
  nextSteps: string[]
}

export interface Recommendation {
  id: string
  category: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  impact: number
  effort: 'easy' | 'medium' | 'hard'
  timeframe: string
  actionItems: string[]
  resources: Array<{
    title: string
    url: string
    type: 'article' | 'tool' | 'service'
  }>
}
