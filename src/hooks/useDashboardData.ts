
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardData {
  userProfile: any;
  latestAssessment: any;
  stats: {
    currentScore: number;
    scoreChange: number;
    totalAssessments: number;
    lastAssessmentDate: string | null;
  };
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): DashboardData {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData>({
    userProfile: null,
    latestAssessment: null,
    stats: {
      currentScore: 0,
      scoreChange: 0,
      totalAssessments: 0,
      lastAssessmentDate: null,
    },
    loading: true,
    error: null,
    refresh: () => {},
  });

  const fetchDashboardData = async () => {
    if (!session?.user?.email) return;

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      setData(prev => ({
        ...prev,
        userProfile: result.userProfile,
        latestAssessment: result.latestAssessment,
        stats: result.stats,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        error: 'Failed to load dashboard data',
        loading: false,
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  const refresh = () => {
    fetchDashboardData();
  };

  setData(prev => ({ ...prev, refresh }));

  return data;
}

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

    let userProfile = null;
    let latestAssessment = null;

    // Try to get the demo user ID from localStorage
    const demoUserId = localStorage.getItem('demoUserId');
    
    if (demoUserId) {
      console.log('🔍 Loading data for user:', demoUserId);
      
      try {
        // Try to get real assessment data from database
        const { data: realAssessment } = await EnhancedDatabaseService.getLatestAssessment(demoUserId);
        if (realAssessment) {
          console.log('✅ Got real assessment from database:', realAssessment);
          latestAssessment = realAssessment;
        }

        // Try to get real user profile from database
        const profileResponse = await fetch('/api/user/profile?userId=' + demoUserId);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            userProfile = profileData.data;
            console.log('✅ Got real user profile from database');
          }
        }
      } catch (dbError) {
        console.warn('Database query failed, using localStorage:', dbError);
      }
    }

    // If no database data, check localStorage for recent results
    if (!userProfile || !latestAssessment) {
      const recentResults = localStorage.getItem('lastAssessmentResults');
      if (recentResults) {
        try {
          const parsed = JSON.parse(recentResults);
          console.log('📱 Using localStorage data as fallback');
          
          // Create user profile from localStorage
          userProfile = userProfile || {
            id: demoUserId || 'demo-user',
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
          latestAssessment = latestAssessment || {
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

    // Calculate stats
    const currentScore = latestAssessment?.overall_score || 0;
    const lastAssessmentDate = latestAssessment?.created_at || null;

    console.log('📈 Final dashboard data loaded:', { 
      currentScore, 
      lastAssessmentDate,
      source: latestAssessment?.id?.includes('local') ? 'localStorage' : 'database'
    });

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
        scoreChange: 0,
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

