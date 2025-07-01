export interface FundabilityCriteria {
  id: string;
  category: string;
  name: string;
  description: string;
  weight: number;
  required: boolean;
  type: 'boolean' | 'text' | 'number' | 'select';
  options?: string[];
}

export interface FundabilityAssessment {
  id: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedCriteria: string[];
  recommendations: Recommendation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number;
  timeToComplete: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  criteriaMet: number;
  totalCriteria: number;
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