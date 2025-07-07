export interface FundabilityCriteria {
  id: string;
  category: string;
  name: string;
  description: string;
  weight: number;
  required: boolean;
  type: 'boolean' | 'text' | 'number' | 'select' | 'range';
  options?: string[];
  min?: number;
  max?: number;
  industrySpecific?: string[];
  businessStageWeight?: {
    startup: number;
    established: number;
    mature: number;
  };
}

export interface FundabilityAssessment {
  id: string;
  userId: string;
  businessId?: string;
  assessmentType: 'simple' | 'advanced';
  score: number;
  maxScore: number;
  percentage: number;
  completedCriteria: string[];
  responses: Record;
  categoryScores: CategoryScore[];
  recommendations: Recommendation[];
  industryBenchmark?: IndustryBenchmark;
  riskFactors: RiskFactor[];
  creditReadinessScore: number;
  fundingPotential: FundingPotential;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  criteriaMet: number;
  totalCriteria: number;
  weight: number;
  industryAverage?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actionItems: ActionItem[];
  estimatedImpact: number;
  timeToComplete: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  dependencies: string[];
  resources: Resource[];
}

export interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
  dueDate?: Date;
  assignedTo?: string;
  notes?: string;
}

export interface Resource {
  type: 'link' | 'document' | 'contact' | 'service';
  title: string;
  url?: string;
  description: string;
}

export interface IndustryBenchmark {
  industry: string;
  averageScore: number;
  topPercentileScore: number;
  medianScore: number;
  commonWeaknesses: string[];
  strengthAreas: string[];
}

export interface RiskFactor {
  category: string;
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  mitigation: string;
}

export interface FundingPotential {
  overallRating: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedCreditLimit: number;
  recommendedFundingTypes: string[];
  timeToFunding: string;
  successProbability: number;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  industry: string;
  businessType: string;
  yearsInBusiness: number;
  employeeCount: number;
  annualRevenue: number;
  businessStage: 'startup' | 'established' | 'mature';
  location: {
    city: string;
    state: string;
    country: string;
  };
}

export const FUNDABILITY_CATEGORIES = [
  'Business Foundation',
  'Legal Structure', 
  'Banking & Finance',
  'Business Credit Profile',
  'Marketing Presence',
  'Operational Excellence',
  'Documentation',
  'Financial Health'
] as const;

export type FundabilityCategory = typeof FUNDABILITY_CATEGORIES[number];

export const INDUSTRY_TYPES = [
  'Technology',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Construction',
  'Professional Services',
  'Food & Beverage',
  'Transportation',
  'Real Estate',
  'Finance',
  'Education',
  'Other'
] as const;

export type IndustryType = typeof INDUSTRY_TYPES[number];