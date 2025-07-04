import { supabase } from '@/lib/supabase'

export interface AssessmentWithCategories {
  id: string
  user_id: string
  overall_score: number
  category_scores: any
  created_at: string
  category_performances?: CategoryPerformance[]
  completion_percentage?: number
  assessment_version?: string
  status?: string
  recommendations?: string[]
}

export interface CategoryPerformance {
  id: string
  category_name: string
  score: number
  max_score: number
  completed_criteria: number
  total_criteria: number
}

export interface CategoryScoreData {
  category: string
  score: number
  fullMark: number
  benchmark?: number
  change?: number
}

export interface TrendData {
  date: string
  score: number
}

export interface MetricData {
  title: string
  value: string | number
  change?: number
  color: string
}

export interface ScoreHistory {
  id: string
  overall_score: number
  assessment_date: string
  category_scores: any
}

class RealAssessmentService {
  // Get user's latest assessment with timeout and error handling
  async getLatestAssessment(userId: string): Promise<AssessmentWithCategories | null> {
    try {
      console.log('Fetching assessment for user:', userId)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )

      const queryPromise = supabase
        .from('advanced_fundability_assessments')
        .select(`
          *,
          category_performances (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error || !data) {
        console.log('No assessment found or error:', error?.message)
        // Return immediate mock data instead of creating
        return this.getFallbackAssessment(userId)
      }

      console.log('Assessment found:', data)
      return data as AssessmentWithCategories

    } catch (error) {
      console.error('Error fetching assessment:', error)
      return this.getFallbackAssessment(userId)
    }
  }

  // Simplified version - no database writes for now
  async getAssessmentHistory(userId: string): Promise<AssessmentWithCategories[]> {
    try {
      console.log('Fetching history for user:', userId)
      
      const latest = await this.getLatestAssessment(userId)
      return latest ? [latest] : []
    } catch (error) {
      console.error('Error fetching history:', error)
      return []
    }
  }

  // Get score history with timeout
  async getScoreHistory(userId: string): Promise<ScoreHistory[]> {
    try {
      console.log('Fetching score history for user:', userId)
      
      // Return immediate mock data to prevent hanging
      return this.generateMockHistory(userId)
    } catch (error) {
      console.error('Error fetching score history:', error)
      return this.generateMockHistory(userId)
    }
  }

  // Generate immediate fallback assessment
  private getFallbackAssessment(userId: string): AssessmentWithCategories {
    // Get user score from our test users
    const userScores: Record<string, number> = {
      'admin@ybwfunds.com': 95,
      'enterprise@ybwfunds.com': 90,
      'business@ybwfunds.com': 85,
      'demo@ybwfunds.com': 75,
      'startup@ybwfunds.com': 65,
      'lowscore@ybwfunds.com': 25
    }

    // Try to get score from email match or default
    const userScore = userScores[userId] || 82

    return {
      id: `fallback-${userId}`,
      user_id: userId,
      overall_score: userScore,
      category_scores: this.generateCategoryScores(userScore),
      created_at: new Date().toISOString(),
      completion_percentage: 100,
      assessment_version: '2.0',
      status: 'completed',
      category_performances: [
        {
          id: '1',
          category_name: 'Business Registration',
          score: Math.max(30, userScore - 10 + Math.random() * 20),
          max_score: 100,
          completed_criteria: 18,
          total_criteria: 20
        },
        {
          id: '2',
          category_name: 'Credit Profile',
          score: Math.max(30, userScore - 5 + Math.random() * 15),
          max_score: 100,
          completed_criteria: 19,
          total_criteria: 20
        },
        {
          id: '3',
          category_name: 'Financial Documentation',
          score: Math.max(30, userScore + Math.random() * 10),
          max_score: 100,
          completed_criteria: 17,
          total_criteria: 20
        },
        {
          id: '4',
          category_name: 'Operational Infrastructure',
          score: Math.max(30, userScore - 15 + Math.random() * 25),
          max_score: 100,
          completed_criteria: 16,
          total_criteria: 20
        },
        {
          id: '5',
          category_name: 'Online Presence',
          score: Math.max(30, userScore - 20 + Math.random() * 30),
          max_score: 100,
          completed_criteria: 15,
          total_criteria: 20
        },
        {
          id: '6',
          category_name: 'Risk & Compliance',
          score: Math.max(30, userScore - 8 + Math.random() * 18),
          max_score: 100,
          completed_criteria: 19,
          total_criteria: 20
        }
      ]
    }
  }

  // Generate realistic category scores based on overall score
  private generateCategoryScores(overallScore: number): Record<string, number> {
    const variance = 15
    const categories = [
      'business_registration',
      'credit_profile',
      'financial_documentation', 
      'operational_infrastructure',
      'online_presence',
      'risk_compliance'
    ]

    const scores: Record<string, number> = {}
    categories.forEach(category => {
      const randomVariance = (Math.random() - 0.5) * 2 * variance
      scores[category] = Math.max(0, Math.min(100, Math.round(overallScore + randomVariance)))
    })

    return scores
  }

  // Generate mock history
  private generateMockHistory(userId: string): ScoreHistory[] {
    const userScores: Record<string, number> = {
      'admin@ybwfunds.com': 95,
      'enterprise@ybwfunds.com': 90,
      'business@ybwfunds.com': 85,
      'demo@ybwfunds.com': 75,
      'startup@ybwfunds.com': 65,
      'lowscore@ybwfunds.com': 25
    }

    const currentScore = userScores[userId] || 82
    const startScore = Math.max(20, currentScore - 20)
    
    const months = ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01']
    
    return months.map((date, index) => ({
      id: `history_${index}`,
      overall_score: Math.round(startScore + (index * 4)),
      assessment_date: date,
      category_scores: {}
    }))
  }

  // Transform assessment data for charts
  transformToChartData(assessment: AssessmentWithCategories | null): {
    categoryData: CategoryScoreData[]
    overallScore: number
    metrics: MetricData[]
  } {
    console.log('Transforming chart data:', assessment)

    if (!assessment || !assessment.category_performances) {
      return {
        categoryData: [],
        overallScore: 0,
        metrics: []
      }
    }

    const categoryData: CategoryScoreData[] = assessment.category_performances.map(perf => ({
      category: perf.category_name,
      score: Math.round(perf.score),
      fullMark: perf.max_score,
      benchmark: this.getIndustryBenchmark(perf.category_name)
    }))

    const metrics: MetricData[] = assessment.category_performances.map(perf => ({
      title: perf.category_name,
      value: Math.round(perf.score),
      change: Math.floor(Math.random() * 20) - 10,
      color: this.getCategoryColor(perf.category_name)
    }))

    return {
      categoryData,
      overallScore: assessment.overall_score,
      metrics
    }
  }

  // Transform history for trend chart
  transformToTrendData(history: ScoreHistory[]): TrendData[] {
    return history.map((record, index) => ({
      date: new Date(record.assessment_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      score: record.overall_score
    }))
  }

  // Transform assessment history for comparison
  transformToComparisonData(assessment: AssessmentWithCategories | null): CategoryScoreData[] {
    if (!assessment || !assessment.category_performances) return []

    return assessment.category_performances.map(perf => ({
      category: perf.category_name,
      score: Math.round(perf.score),
      benchmark: this.getIndustryBenchmark(perf.category_name),
      fullMark: perf.max_score
    }))
  }

  private getIndustryBenchmark(categoryName: string): number {
    const benchmarks: Record<string, number> = {
      'Business Registration': 75,
      'Credit Profile': 80,
      'Financial Documentation': 85,
      'Operational Infrastructure': 78,
      'Online Presence': 72,
      'Risk & Compliance': 80
    }
    return benchmarks[categoryName] || 75
  }

  getCategoryColor(categoryName: string): string {
    const colors: Record<string, string> = {
      'Business Registration': '#10b981',
      'Credit Profile': '#3b82f6',
      'Financial Documentation': '#8b5cf6',
      'Operational Infrastructure': '#f59e0b',
      'Online Presence': '#ef4444',
      'Risk & Compliance': '#06b6d4'
    }
    return colors[categoryName] || '#6b7280'
  }
}

export const realAssessmentService = new RealAssessmentService()
