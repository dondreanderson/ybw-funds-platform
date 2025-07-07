import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { supabase } from '@/lib/supabase'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Type definitions for database operations
export type Tables = Database['public']['Tables']
export type AdvancedAssessment = Tables['advanced_fundability_assessments']['Row']
export type FundabilityAssessment = Tables['fundability_assessments']['Row']
export type BusinessProfile = Tables['business_profiles']['Row']
export type UserProfile = Tables['user_profiles']['Row']
export type AssessmentRecommendation = Tables['assessment_recommendations']['Row']
export type FundingOpportunity = Tables['funding_opportunities']['Row']

// Database response types
export interface DatabaseResponse<T> {
  data: T | null
  error: Error | null
  count?: number
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * ============================================================================
 * USER MANAGEMENT SERVICES
 * ============================================================================
 */

export class UserService {
  // Get user profile with business information
  static async getUserProfile(userId: string): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          business_profiles (*)
        `)
        .eq('id', userId)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string, 
    updates: Partial<Tables['user_profiles']['Update']>
  ): Promise<DatabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Create business profile
  static async createBusinessProfile(
    profileData: Tables['business_profiles']['Insert']
  ): Promise<DatabaseResponse<BusinessProfile>> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .insert(profileData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update business profile
  static async updateBusinessProfile(
    userId: string,
    updates: Partial<Tables['business_profiles']['Update']>
  ): Promise<DatabaseResponse<BusinessProfile>> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * ASSESSMENT SERVICES
 * ============================================================================
 */

export class AssessmentService {
  // Create simple fundability assessment
  static async createSimpleAssessment(
    assessmentData: Tables['fundability_assessments']['Insert']
  ): Promise<DatabaseResponse<FundabilityAssessment>> {
    try {
      const { data, error } = await supabase
        .from('fundability_assessments')
        .insert(assessmentData)
        .select()
        .single()

      // Update user's fundability score
      if (data && !error) {
        await UserService.updateUserProfile(data.user_id!, {
          fundability_score: data.score,
          last_assessment_date: new Date().toISOString()
        })
      }

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Create advanced fundability assessment
  static async createAdvancedAssessment(
    assessmentData: Tables['advanced_fundability_assessments']['Insert']
  ): Promise<DatabaseResponse<AdvancedAssessment>> {
    try {
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .insert(assessmentData)
        .select()
        .single()

      // Create score history entry
      if (data && !error) {
        await ScoreHistoryService.createScoreEntry({
          user_id: data.user_id!,
          assessment_id: data.id,
          overall_score: data.overall_score,
          category_scores: data.category_scores,
          assessment_date: new Date().toDateString()
        })

        // Update user profile
        await UserService.updateUserProfile(data.user_id!, {
          fundability_score: data.overall_score,
          last_assessment_date: new Date().toISOString()
        })
      }

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get user's assessment history
  static async getAssessmentHistory(
    userId: string,
    options: PaginationOptions = {}
  ): Promise<DatabaseResponse<AdvancedAssessment[]>> {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options

      const { data, error, count } = await supabase
        .from('advanced_fundability_assessments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1)

      return { data, error, count: count || 0 }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get latest assessment for user
  static async getLatestAssessment(
    userId: string
  ): Promise<DatabaseResponse<AdvancedAssessment>> {
    try {
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .select(`
          *,
          assessment_recommendations (*),
          category_assessments (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update assessment status
  static async updateAssessmentStatus(
    assessmentId: string,
    status: string,
    completedAt?: string
  ): Promise<DatabaseResponse<AdvancedAssessment>> {
    try {
      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .update({
          status,
          completed_at: completedAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * CRITERIA AND RESPONSES SERVICES
 * ============================================================================
 */

export class CriteriaService {
  // Get all fundability criteria
  static async getAllCriteria(): Promise<DatabaseResponse<Tables['fundability_criteria']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria')
        .select('*')
        .order('category')
        .order('weight', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get criteria by category
  static async getCriteriaByCategory(
    category: string
  ): Promise<DatabaseResponse<Tables['fundability_criteria']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria')
        .select('*')
        .eq('category', category)
        .order('weight', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Save criteria responses
  static async saveCriteriaResponses(
    responses: Tables['fundability_criteria_responses']['Insert'][]
  ): Promise<DatabaseResponse<Tables['fundability_criteria_responses']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .insert(responses)
        .select()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get criteria responses for assessment
  static async getCriteriaResponses(
    assessmentId: string
  ): Promise<DatabaseResponse<Tables['fundability_criteria_responses']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('category')

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update single criteria response
  static async updateCriteriaResponse(
    responseId: string,
    updates: Partial<Tables['fundability_criteria_responses']['Update']>
  ): Promise<DatabaseResponse<Tables['fundability_criteria_responses']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('fundability_criteria_responses')
        .update({
          ...updates,
          answered_at: new Date().toISOString()
        })
        .eq('id', responseId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * RECOMMENDATIONS SERVICES
 * ============================================================================
 */

export class RecommendationService {
  // Create assessment recommendations
  static async createRecommendations(
    recommendations: Tables['assessment_recommendations']['Insert'][]
  ): Promise<DatabaseResponse<AssessmentRecommendation[]>> {
    try {
      const { data, error } = await supabase
        .from('assessment_recommendations')
        .insert(recommendations)
        .select()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get recommendations for assessment
  static async getRecommendations(
    assessmentId: string
  ): Promise<DatabaseResponse<AssessmentRecommendation[]>> {
    try {
      const { data, error } = await supabase
        .from('assessment_recommendations')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('priority', { ascending: false })
        .order('estimated_impact_points', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get recommendations by priority
  static async getRecommendationsByPriority(
    assessmentId: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<DatabaseResponse<AssessmentRecommendation[]>> {
    try {
      const { data, error } = await supabase
        .from('assessment_recommendations')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('priority', priority)
        .order('estimated_impact_points', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Track recommendation completion
  static async trackRecommendationProgress(
    trackingData: Tables['fundability_recommendations_tracking']['Insert']
  ): Promise<DatabaseResponse<Tables['fundability_recommendations_tracking']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('fundability_recommendations_tracking')
        .insert(trackingData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update recommendation status
  static async updateRecommendationStatus(
    trackingId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'skipped',
    notes?: string
  ): Promise<DatabaseResponse<Tables['fundability_recommendations_tracking']['Row']>> {
    try {
      const updates: Partial<Tables['fundability_recommendations_tracking']['Update']> = {
        status,
        updated_at: new Date().toISOString()
      }

      if (notes) updates.notes = notes
      if (status === 'completed') updates.completed_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('fundability_recommendations_tracking')
        .update(updates)
        .eq('id', trackingId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * SCORE HISTORY AND ANALYTICS SERVICES
 * ============================================================================
 */

export class ScoreHistoryService {
  // Create score history entry
  static async createScoreEntry(
    scoreData: Tables['score_history']['Insert']
  ): Promise<DatabaseResponse<Tables['score_history']['Row']>> {
    try {
      // Calculate score change from previous assessment
      const { data: previousScore } = await supabase
        .from('score_history')
        .select('overall_score')
        .eq('user_id', scoreData.user_id!)
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single()

      const scoreChange = previousScore 
        ? scoreData.overall_score - previousScore.overall_score 
        : 0

      const { data, error } = await supabase
        .from('score_history')
        .insert({
          ...scoreData,
          score_change: scoreChange
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get score history for user
  static async getScoreHistory(
    userId: string,
    limit: number = 10
  ): Promise<DatabaseResponse<Tables['score_history']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
        .limit(limit)

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get score trend analytics
  static async getScoreTrend(
    userId: string,
    days: number = 30
  ): Promise<DatabaseResponse<Tables['score_history']['Row'][]>> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .eq('user_id', userId)
        .gte('assessment_date', cutoffDate.toISOString())
        .order('assessment_date', { ascending: true })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

export class AnalyticsService {
  // Create analytics entry
  static async createAnalyticsEntry(
    analyticsData: Tables['assessment_analytics']['Insert']
  ): Promise<DatabaseResponse<Tables['assessment_analytics']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('assessment_analytics')
        .insert(analyticsData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get user analytics
  static async getUserAnalytics(
    userId: string,
    limit: number = 10
  ): Promise<DatabaseResponse<Tables['assessment_analytics']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('assessment_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
        .limit(limit)

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Calculate industry percentile
  static async calculateIndustryPercentile(
    score: number,
    industry: string
  ): Promise<DatabaseResponse<number>> {
    try {
      const { data, error } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('industry_name', industry)
        .single()

      if (error || !data) return { data: 50, error } // Default percentile

      // Calculate percentile based on industry benchmarks
      let percentile = 50
      if (score >= data.percentile_90!) percentile = 90
      else if (score >= data.percentile_75!) percentile = 75
      else if (score >= data.percentile_50!) percentile = 50
      else if (score >= data.percentile_25!) percentile = 25
      else percentile = 10

      return { data: percentile, error: null }
    } catch (error) {
      return { data: 50, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * FUNDING OPPORTUNITIES AND MATCHING SERVICES
 * ============================================================================
 */

export class FundingService {
  // Get funding opportunities
  static async getFundingOpportunities(
    filters: {
      minCreditScore?: number
      maxLoanAmount?: number
      requiresPersonalGuarantee?: boolean
      industry?: string
    } = {}
  ): Promise<DatabaseResponse<FundingOpportunity[]>> {
    try {
      let query = supabase
        .from('funding_opportunities')
        .select('*')
        .eq('is_active', true)

      if (filters.minCreditScore) {
        query = query.lte('min_credit_score', filters.minCreditScore)
      }
      if (filters.maxLoanAmount) {
        query = query.gte('max_loan_amount', filters.maxLoanAmount)
      }
      if (filters.requiresPersonalGuarantee !== undefined) {
        query = query.eq('requires_personal_guarantee', filters.requiresPersonalGuarantee)
      }

      const { data, error } = await query.order('max_loan_amount', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Create funding match
  static async createFundingMatch(
    matchData: Tables['user_funding_matches']['Insert']
  ): Promise<DatabaseResponse<Tables['user_funding_matches']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('user_funding_matches')
        .insert(matchData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get user funding matches
  static async getUserFundingMatches(
    userId: string
  ): Promise<DatabaseResponse<Tables['user_funding_matches']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('user_funding_matches')
        .select(`
          *,
          funding_opportunities (*)
        `)
        .eq('user_id', userId)
        .order('match_score', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update funding match status
  static async updateFundingMatchStatus(
    matchId: string,
    status: string,
    appliedAt?: string
  ): Promise<DatabaseResponse<Tables['user_funding_matches']['Row']>> {
    try {
      const updates: Partial<Tables['user_funding_matches']['Update']> = {
        application_status: status
      }

      if (appliedAt) updates.applied_at = appliedAt

      const { data, error } = await supabase
        .from('user_funding_matches')
        .update(updates)
        .eq('id', matchId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * REPORTS AND DOCUMENT SERVICES
 * ============================================================================
 */

export class ReportService {
  // Create assessment report
  static async createAssessmentReport(
    reportData: Tables['assessment_reports']['Insert']
  ): Promise<DatabaseResponse<Tables['assessment_reports']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('assessment_reports')
        .insert(reportData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get user reports
  static async getUserReports(
    userId: string
  ): Promise<DatabaseResponse<Tables['assessment_reports']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('assessment_reports')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update report download count
  static async updateReportDownloadCount(
    reportId: string
  ): Promise<DatabaseResponse<Tables['assessment_reports']['Row']>> {
    try {
      const { data, error } = await supabase
        .rpc('increment_download_count', { report_id: reportId })

      const { data: updatedReport, error: fetchError } = await supabase
        .from('assessment_reports')
        .select('*')
        .eq('id', reportId)
        .single()

      return { data: updatedReport, error: fetchError || error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Create fundability report
  static async createFundabilityReport(
    reportData: Tables['fundability_reports']['Insert']
  ): Promise<DatabaseResponse<Tables['fundability_reports']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('fundability_reports')
        .insert(reportData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * NOTIFICATION SERVICES
 * ============================================================================
 */

export class NotificationService {
  // Create notification
  static async createNotification(
    notificationData: Tables['notifications']['Insert']
  ): Promise<DatabaseResponse<Tables['notifications']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<DatabaseResponse<Tables['notifications']['Row'][]>> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)

      if (unreadOnly) {
        query = query.is('read_at', null)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Mark notification as read
  static async markNotificationRead(
    notificationId: string
  ): Promise<DatabaseResponse<Tables['notifications']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Mark all notifications as read for user
  static async markAllNotificationsRead(
    userId: string
  ): Promise<DatabaseResponse<Tables['notifications']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
        .select()

      return { data, error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

/**
 * ============================================================================
 * REAL-TIME SUBSCRIPTIONS
 * ============================================================================
 */

export class RealtimeService {
  // Subscribe to assessment updates
  static subscribeToAssessments(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`assessments:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'advanced_fundability_assessments',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // Subscribe to score updates
  static subscribeToScoreUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`scores:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'score_history',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // Subscribe to notifications
  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

export class DatabaseUtils {
  // Generic function to handle database operations with error handling
  static async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<DatabaseResponse<T>> {
    try {
      const result = await queryFn()
      return result
    } catch (error) {
      console.error('Database operation failed:', error)
      return { data: null, error: error as Error }
    }
  }

  // Batch operation helper
  static async batchOperation<T>(
    operations: Array<() => Promise<DatabaseResponse<T>>>
  ): Promise<DatabaseResponse<T[]>> {
    try {
      const results = await Promise.all(operations.map(op => op()))
      const data = results.map(r => r.data).filter(Boolean) as T[]
      const errors = results.filter(r => r.error).map(r => r.error)
      
      return {
        data,
        error: errors.length > 0 ? new Error(`Batch operation errors: ${errors.length}`) : null
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Health check for database connection
  static async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }
}

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

// Default export
export default {
  UserService,
  AssessmentService,
  CriteriaService,
  RecommendationService,
  ScoreHistoryService,
  AnalyticsService,
  FundingService,
  ReportService,
  NotificationService,
  RealtimeService,
  DatabaseUtils
}