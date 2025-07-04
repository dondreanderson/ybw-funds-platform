'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CategoryRadarChart from '../charts/CategoryRadarChart';
import ScoreTrendChart from '../charts/ScoreTrendChart';
import CategoryBarChart from '../charts/CategoryBarChart';
import ProgressRingChart from '../charts/ProgressRingChart';
import { realAssessmentService, type AssessmentWithCategories, type ScoreHistory } from '@/lib/services/realAssessmentService';

interface AnalyticsSectionProps {
  assessment: AssessmentWithCategories | null;
  history: AssessmentWithCategories[];
}

export default function AnalyticsSection({ assessment, history }: AnalyticsSectionProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);

  useEffect(() => {
    if (user) {
      realAssessmentService.getScoreHistory(user.id).then(setScoreHistory);
    }
  }, [user]);

  if (!assessment) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Analytics Overview
        </h3>
        <div className="text-center py-8 text-gray-500">
          No assessment data available for analytics
        </div>
      </div>
    );
  }

  const { categoryData } = realAssessmentService.transformToChartData(assessment);
  const trendData = realAssessmentService.transformToTrendData(scoreHistory);
  const comparisonData = realAssessmentService.transformToComparisonData(assessment);

  // Create progress data from category performances
  const progressData = assessment.category_performances?.slice(0, 3).map(perf => ({
    name: perf.category_name,
    value: Math.round((perf.score / perf.max_score) * 100),
    color: realAssessmentService['getCategoryColor'](perf.category_name) || '#3b82f6'
  })) || [];

  // Fix: Create render functions instead of storing components directly
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CategoryRadarChart data={categoryData} key="overview" />;
      case 'trends':
        return <ScoreTrendChart data={trendData} key="trends" />;
      case 'comparison':
        return <CategoryBarChart data={comparisonData} key="comparison" />;
      case 'progress':
        return <ProgressRingChart data={progressData} key="progress" />;
      default:
        return <CategoryRadarChart data={categoryData} key="default" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'comparison', label: 'Comparison' },
    { id: 'progress', label: 'Progress' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
          Analytics Overview
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                console.log(`Switching to tab: ${tab.id}`);
                setActiveTab(tab.id);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Assessment Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Categories:</span>
            <span className="ml-1 font-medium">{assessment.category_performances?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Completion:</span>
            <span className="ml-1 font-medium">{assessment.completion_percentage || 100}%</span>
          </div>
          <div>
            <span className="text-gray-500">Time:</span>
            <span className="ml-1 font-medium">{assessment.completion_time_minutes || 'N/A'} min</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className="ml-1 font-medium capitalize">{assessment.status || 'completed'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
