'use client';

import { useState, useEffect } from 'react';
import { 
  UserService, 
  EnhancedDatabaseService, 
  realAssessmentService 
} from '@/lib/services/index';
import type { UserProfile, BusinessProfile, Assessment } from '@/lib/types/core';

export interface DashboardData {
  userProfile: (UserProfile & { business_profile?: BusinessProfile }) | null;
  latestAssessment: Assessment | null;
  assessmentHistory: Assessment[];
  scoreTrend: any[];
  loading: boolean;
  error: string | null;
  stats: {
    totalAssessments: number;
    currentScore: number;
    scoreChange: number;
    lastAssessmentDate: string | null;
  };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    userProfile: null,
    latestAssessment: null,
    assessmentHistory: [],
    scoreTrend: [],
    loading: true,
    error: null,
    stats: {
      totalAssessments: 0,
      currentScore: 0,
      scoreChange: 0,
      lastAssessmentDate: null
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen for dashboard refresh events
  useEffect(() => {
    const handleDashboardRefresh = () => {
      console.log('🔄 Dashboard refresh triggered, reloading data...');
      // Force reload with a small delay to ensure database is updated
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    };

    window.addEventListener('dashboardRefresh', handleDashboardRefresh);

    return () => {
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, []);

  // Check for recent assessment results from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const recentResults = localStorage.getItem('lastAssessmentResults');
      if (recentResults) {
        try {
          const parsed = JSON.parse(recentResults);
          const completedAt = new Date(parsed.completedAt);
          const now = new Date();
          const timeDiff = now.getTime() - completedAt.getTime();
          const minutesDiff = timeDiff / (1000 * 60);

          // If assessment was completed in the last 5 minutes, force refresh
          if (minutesDiff < 5) {
            console.log('🆕 Recent assessment detected, refreshing dashboard...');
            loadDashboardData();
          }
        } catch (error) {
          console.error('Error parsing recent assessment results:', error);
        }
      }
    };

    // Check immediately
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...');
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Always try to get fresh data first
      let userProfile = null;
      let latestAssessment = null;

      // Try to get real user data
      const { data: realUserProfile, error: userError } = await UserService.getCurrentUserProfile();
      
      if (realUserProfile && !userError) {
        console.log('✅ Got real user profile:', realUserProfile);
        userProfile = realUserProfile;

        // Try to get real assessment data
        const { data: realAssessment } = await EnhancedDatabaseService.getLatestAssessment(userProfile.id);
        if (realAssessment) {
          console.log('✅ Got real assessment data:', realAssessment);
          latestAssessment = realAssessment;
        }
      }

      // If no real data, check localStorage for recent results
      if (!userProfile || !latestAssessment) {
        const recentResults = localStorage.getItem('lastAssessmentResults');
        if (recentResults) {
          try {
            const parsed = JSON.parse(recentResults);
            console.log('📱 Using localStorage data:', parsed);
            
            // Create user profile from localStorage or use fallback
            userProfile = userProfile || {
              id: 'demo-user',
              email: 'demo@ybwfunds.com',
              name: 'Demo User',
              business_name: 'Demo Business',
              fundability_score: parsed.currentScore,
              assessment_count: 1,
              last_assessment_date: parsed.completedAt,
              created_at: new Date().toISOString(),
              updated_at: parsed.completedAt
            };

            // Create assessment from localStorage
            latestAssessment = {
              id: 'local-assessment',
              user_id: userProfile.id,
              overall_score: parsed.currentScore,
              category_scores: parsed.categoryScores,
              completion_percentage: 100,
              status: 'completed',
              assessment_version: '2.0',
              created_at: parsed.completedAt,
              updated_at: parsed.completedAt
            };
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
          }
        }
      }

      // Final fallback to realAssessmentService
      if (!userProfile || !latestAssessment) {
        console.log('🔄 Using fallback assessment service...');
        const fallbackAssessment = await realAssessmentService.getLatestAssessment('demo-user');
        
        if (fallbackAssessment) {
          userProfile = userProfile || {
            id: 'demo-user',
            email: 'demo@ybwfunds.com',
            name: 'Demo User',
            business_name: 'Demo Business',
            fundability_score: fallbackAssessment.overall_score,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          latestAssessment = {
            ...fallbackAssessment,
            updated_at: fallbackAssessment.created_at || new Date().toISOString()
          };
        }
      }

      // Calculate stats
      const currentScore = latestAssessment?.overall_score || 0;
      const lastAssessmentDate = latestAssessment?.created_at || null;

      console.log('📈 Final dashboard data:', { currentScore, lastAssessmentDate });

      setData({
        userProfile: userProfile,
        latestAssessment: latestAssessment,
        assessmentHistory: latestAssessment ? [latestAssessment] : [],
        scoreTrend: [],
        loading: false,
        error: null,
        stats: {
          totalAssessments: 1,
          currentScore: currentScore,
          scoreChange: 0, // We'll calculate this later with history
          lastAssessmentDate
        }
      });

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load dashboard data'
      }));
    }
  };

  const refresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadDashboardData();
  };

  return { ...data, refresh };
}
