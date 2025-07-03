// TypeScript interfaces for dashboard data
export interface CategoryData {
  category: string;
  score: number;
  fullMark: number;
  benchmark?: number;
}

export interface TrendData {
  date: string;
  score: number;
}

export interface ProgressData {
  name: string;
  value: number;
  color: string;
}

export interface MetricData {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

export interface ComparisonData {
  category: string;
  score: number;
  benchmark: number;
}

export interface HistoryData {
  date: string;
  score: number;
  categories: {
    name: string;
    score: number;
    change: number;
  }[];
}

// Mock data for development
export const mockCategoryData: CategoryData[] = [
  { category: 'Credit Profile', score: 85, fullMark: 100 },
  { category: 'Financial Health', score: 78, fullMark: 100 },
  { category: 'Business Plan', score: 92, fullMark: 100 },
  { category: 'Collateral', score: 65, fullMark: 100 },
  { category: 'Management', score: 88, fullMark: 100 },
  { category: 'Industry Risk', score: 73, fullMark: 100 }
];

export const mockTrendData: TrendData[] = [
  { date: 'Jan', score: 65 },
  { date: 'Feb', score: 68 },
  { date: 'Mar', score: 72 },
  { date: 'Apr', score: 75 },
  { date: 'May', score: 78 },
  { date: 'Jun', score: 82 }
];

export const mockComparisonData: ComparisonData[] = [
  { category: 'Credit Profile', score: 85, benchmark: 75 },
  { category: 'Financial Health', score: 78, benchmark: 80 },
  { category: 'Business Plan', score: 92, benchmark: 85 },
  { category: 'Collateral', score: 65, benchmark: 70 },
  { category: 'Management', score: 88, benchmark: 82 },
  { category: 'Industry Risk', score: 73, benchmark: 78 }
];

export const mockProgressData: ProgressData[] = [
  { name: 'Documentation', value: 92, color: '#10b981' },
  { name: 'Financial', value: 78, color: '#3b82f6' },
  { name: 'Legal', value: 85, color: '#8b5cf6' }
];

// Utility functions
export const calculateOverallScore = (categories: CategoryData[]): number => {
  const weights = {
    'Credit Profile': 0.25,
    'Financial Health': 0.20,
    'Business Plan': 0.20,
    'Collateral': 0.15,
    'Management': 0.10,
    'Industry Risk': 0.10
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  categories.forEach(category => {
    const weight = weights[category.category as keyof typeof weights] || 0;
    totalScore += category.score * weight;
    totalWeight += weight;
  });
  
  return Math.round(totalScore / totalWeight);
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#f59e0b'; // Amber
  if (score >= 40) return '#ef4444'; // Red
  return '#6b7280'; // Gray
};

export const getScoreStatus = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

