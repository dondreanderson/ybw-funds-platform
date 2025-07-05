'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { realAssessmentService, type AssessmentWithCategories } from '@/lib/services/realAssessmentService';
import AnalyticsSection from './AnalyticsSection';
import MetricsOverview from './MetricsOverview';
import AssessmentHistory from './AssessmentHistory';
import LoadingSpinner from './LoadingSpinner';
import { LogOut } from 'lucide-react'; // Add this import

interface EnhancedDashboardProps {
  userId?: string;
  className?: string;
}

export default function EnhancedDashboard({ className = '' }: EnhancedDashboardProps) {
  const { user, loading: authLoading, signOut } = useAuth(); // Add signOut
  const [latestAssessment, setLatestAssessment] = useState<AssessmentWithCategories | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const useDashboardData = (userId: string) => { 
    const [dashboardData, setDashboardData] = useState(null); 
    useEffect(() => { 
      const fetchDashboardData = async () => { // Fetch latest assessment from existing table 
      const { data: latestAssessment } = await supabase 
      .from('advanced_fundability_assessments') 
      .select('*') 
      .eq('user_id', userId) 
      .order('created_at', { ascending: false }) 
      .limit(1) 
      .single(); // Fetch score history from existing table 
      
      const { data: scoreHistory } = await supabase 
      .from('score_history') 
      .select('*') .eq('user_id', userId) 
      .order('assessment_date', { ascending: true }); // Fetch business profile from existing table 
      
      const { data: businessProfile } = await supabase 
      .from('business_profiles') 
      .select('*') 
      .eq('user_id', userId) 
      .single(); setDashboardData({ latestAssessment, 
        scoreHistory, 
        businessProfile 
      }); 
    }; fetchDashboardData(); 
  }, [userId]); 
  return dashboardData; 
}; 


  useEffect(() => {
    if (!user || authLoading) return;

    const loadDashboardData = async () => {
      try {
        console.log('Loading dashboard data for user:', user.email);
        setLoading(true);
        setError(null);

        // Use email as ID for our test users
        const userIdentifier = user.email || user.id;

        // Add timeout for the entire operation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Dashboard load timeout')), 15000)
        );

        const dataPromise = Promise.all([
          realAssessmentService.getLatestAssessment(userIdentifier),
          realAssessmentService.getAssessmentHistory(userIdentifier)
        ]);

        const [latest, history] = await Promise.race([dataPromise, timeoutPromise]) as any;

        console.log('Data loaded:', { latest, history });
        
        setLatestAssessment(latest);
        setAssessmentHistory(history);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        // Set fallback data to prevent total failure
        const fallbackAssessment = {
          id: 'fallback',
          user_id: user.email || user.id,
          overall_score: user.fundability_score || 75,
          category_scores: {},
          created_at: new Date().toISOString(),
          completion_percentage: 100,
          assessment_version: '2.0',
          status: 'completed'
        };
        setLatestAssessment(fallbackAssessment);
        setAssessmentHistory([fallbackAssessment]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, authLoading]);

  // Show loading state
  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  // Show error state but still try to render with fallback data
  if (error && !latestAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show dashboard even if we had to use fallback data
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header with user info and logout */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Fundability Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor your business funding readiness and track improvements over time
              </p>
            </div>
            
            {/* User info and logout button */}
            <div className="text-right">
              <div className="mb-2">
                <p className="text-sm text-gray-600">Logged in as:</p>
                <p className="font-medium text-gray-900">{user?.business_name || user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          {latestAssessment && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(latestAssessment.created_at).toLocaleDateString()}
            </p>
          )}
          {error && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Using cached data due to connection issues
            </p>
          )}
        </div>

        <div className="space-y-8">
          <MetricsOverview assessment={latestAssessment} />
          <AnalyticsSection 
            assessment={latestAssessment} 
            history={assessmentHistory} 
          />
          <AssessmentHistory assessments={assessmentHistory} />
        </div>
      </div>
    </motion.div>
  );
}
