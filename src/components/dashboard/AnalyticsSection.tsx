'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../../types/common';

interface ScoreHistoryItem {
  id: string;
  date: string;
  score: number;
  change: number;
}

interface AnalyticsData {
  totalAssessments: number;
  averageScore: number;
  scoreImprovement: number;
  industryRanking: number;
}

// Mock assessment service - replace with your actual service
const realAssessmentService = {
  getScoreHistory: async (userId: string): Promise<ScoreHistoryItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    return [
      { id: '1', date: '2024-01-01', score: 65, change: 0 },
      { id: '2', date: '2024-02-01', score: 72, change: 7 },
      { id: '3', date: '2024-03-01', score: 78, change: 6 },
      { id: '4', date: '2024-04-01', score: 85, change: 7 },
      { id: '5', date: '2024-05-01', score: 82, change: -3 },
    ];
  },

  getAnalyticsData: async (userId: string): Promise<AnalyticsData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock analytics data
    return {
      totalAssessments: 5,
      averageScore: 76.4,
      scoreImprovement: 17,
      industryRanking: 78
    };
  }
};

const AnalyticsSection: React.FC = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user and load data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Mock user - replace with your actual auth
        const mockUser: User = {
          id: 'user_123',
          email: 'user@example.com',
          name: 'John Doe'
        };
        setUser(mockUser);
        return mockUser;
      } catch (error) {
        console.error('Failed to initialize user:', error);
        setError('Failed to load user data');
        return null;
      }
    };

    const loadData = async () => {
      setLoading(true);
      const currentUser = await initializeUser();
      
      if (currentUser) {
        try {
          // Load analytics data in parallel
          const [historyData, analytics] = await Promise.all([
            realAssessmentService.getScoreHistory(currentUser.id),
            realAssessmentService.getAnalyticsData(currentUser.id)
          ]);
          
          setScoreHistory(historyData);
          setAnalyticsData(analytics);
        } catch (error) {
          console.error('Failed to load analytics data:', error);
          setError('Failed to load analytics data');
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  // Calculate score trend
  const getScoreTrend = (): 'up' | 'down' | 'stable' => {
    if (scoreHistory.length < 2) return 'stable';
    
    const recent = scoreHistory.slice(-2);
    const [previous, current] = recent;
    
    if (current.score > previous.score) return 'up';
    if (current.score < previous.score) return 'down';
    return 'stable';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const trend = getScoreTrend();
  const latestScore = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1].score : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="text-sm text-gray-500">
          Welcome, {user?.name || user?.email}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Assessments</p>
              <p className="text-2xl font-bold">{analyticsData?.totalAssessments || 0}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Average Score</p>
              <p className="text-2xl font-bold">{analyticsData?.averageScore?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Improvement</p>
              <p className="text-2xl font-bold">+{analyticsData?.scoreImprovement || 0}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Industry Rank</p>
              <p className="text-2xl font-bold">{analyticsData?.industryRanking || 0}%</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Score History Chart */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Score History</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Current Score:</span>
            <span className="text-lg font-bold text-blue-600">{latestScore}</span>
            {trend === 'up' && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            )}
            {trend === 'down' && (
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>

        {scoreHistory.length > 0 ? (
          <div className="space-y-3">
            {scoreHistory.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(item.date)}</p>
                    <p className="text-sm text-gray-500">Assessment #{index + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{item.score}</p>
                  {item.change !== 0 && (
                    <p className={`text-sm ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change > 0 ? '+' : ''}{item.change}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>No assessment history available</p>
            <p className="text-sm">Complete your first assessment to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;
