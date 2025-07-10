
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
