'use client';

import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ScoreGauge } from './ScoreGauge';
import { AssessmentHistory } from './AssessmentHistory';
import { QuickStats } from './QuickStats';

export function DashboardOverview() {
  const { userProfile, latestAssessment, stats, loading, error, refresh } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button 
          onClick={refresh}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">
          Welcome back, {userProfile?.name || 'User'}!
        </h1>
        <p className="mt-2 opacity-90">
          {userProfile?.business_name ? `Managing ${userProfile.business_name}` : 'Track your business fundability progress'}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStats
          title="Current Score"
          value={stats.currentScore}
          change={stats.scoreChange}
          icon="📊"
        />
        <QuickStats
          title="Total Assessments"
          value={stats.totalAssessments}
          icon="📋"
        />
        <QuickStats
          title="Last Assessment"
          value={stats.lastAssessmentDate ? new Date(stats.lastAssessmentDate).toLocaleDateString() : 'Never'}
          icon="📅"
        />
        <QuickStats
          title="Fundability Grade"
          value={getGrade(stats.currentScore)}
          icon="🎓"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Gauge */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Fundability Score</h3>
          <ScoreGauge
            score={stats.currentScore}
            size={200}
          />
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.currentScore}</p>
            <p className="text-gray-600">Grade: {getGrade(stats.currentScore)}</p>
          </div>
        </div>

        {/* Assessment History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Assessment History</h3>
          <AssessmentHistory
            assessments={[]} // We'll populate this later
            loading={loading}
          />
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-gray-500 text-center py-8">
          <p>Activity tracking coming soon...</p>
          <p className="text-sm mt-2">We'll show your recent assessments, score changes, and recommendations here.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/assessment'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Take New Assessment
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
            View Recommendations
          </button>
          <button
            onClick={() => window.print()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function - MOVED OUTSIDE the component
function getGrade(score: number): string {
  if (score >= 90) return 'A - Excellent';
  if (score >= 80) return 'B - Good';
  if (score >= 70) return 'C - Fair';
  if (score >= 60) return 'D - Poor';
  return 'F - Very Poor';
}
