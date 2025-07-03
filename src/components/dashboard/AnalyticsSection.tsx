'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import CategoryRadarChart from '../charts/CategoryRadarChart';
import ScoreTrendChart from '../charts/ScoreTrendChart';
import CategoryBarChart from '../charts/CategoryBarChart';
import ProgressRingChart from '../charts/ProgressRingChart';

export default function AnalyticsSection() {
  const [activeTab, setActiveTab] = useState('overview');

  const radarData = [
    { category: 'Credit Profile', score: 85, fullMark: 100 },
    { category: 'Financial Health', score: 78, fullMark: 100 },
    { category: 'Business Plan', score: 92, fullMark: 100 },
    { category: 'Collateral', score: 65, fullMark: 100 },
    { category: 'Management', score: 88, fullMark: 100 },
    { category: 'Industry Risk', score: 73, fullMark: 100 }
  ];

  const trendData = [
    { date: 'Jan', score: 65 },
    { date: 'Feb', score: 68 },
    { date: 'Mar', score: 72 },
    { date: 'Apr', score: 75 },
    { date: 'May', score: 78 },
    { date: 'Jun', score: 82 }
  ];

  const barData = [
    { category: 'Credit Profile', score: 85, benchmark: 75 },
    { category: 'Financial Health', score: 78, benchmark: 80 },
    { category: 'Business Plan', score: 92, benchmark: 85 },
    { category: 'Collateral', score: 65, benchmark: 70 },
    { category: 'Management', score: 88, benchmark: 82 },
    { category: 'Industry Risk', score: 73, benchmark: 78 }
  ];

  const progressData = [
    { name: 'Documentation', value: 92, color: '#10b981' },
    { name: 'Financial', value: 78, color: '#3b82f6' },
    { name: 'Legal', value: 85, color: '#8b5cf6' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', component: <CategoryRadarChart data={radarData} /> },
    { id: 'trends', label: 'Trends', component: <ScoreTrendChart data={trendData} /> },
    { id: 'comparison', label: 'Comparison', component: <CategoryBarChart data={barData} /> },
    { id: 'progress', label: 'Progress', component: <ProgressRingChart data={progressData} /> }
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
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </motion.div>
  );
}
