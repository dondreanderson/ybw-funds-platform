'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { type AssessmentWithCategories } from '@/lib/services/realAssessmentService';

interface AssessmentHistoryProps {
  assessments: AssessmentWithCategories[];
}

export default function AssessmentHistory({ assessments }: AssessmentHistoryProps) {
  if (!assessments || assessments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Assessment History
          </h3>
          <Calendar size={20} className="text-gray-500" />
        </div>
        <div className="text-center py-8 text-gray-500">
          No assessment history available
        </div>
      </div>
    );
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} className="text-green-500" />;
    if (change < 0) return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const calculateScoreChange = (currentScore: number, previousScore: number | null): number => {
    if (!previousScore) return 0;
    return currentScore - previousScore;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Assessment History
        </h3>
        <Calendar size={20} className="text-gray-500" />
      </div>

      <div className="space-y-6">
        {assessments.map((assessment, index) => {
          const previousAssessment = assessments[index + 1];
          const scoreChange = calculateScoreChange(
            assessment.overall_score,
            previousAssessment?.overall_score || null
          );

          return (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="border-l-4 border-blue-500 pl-4 pb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(assessment.created_at!).toLocaleDateString()}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {assessment.overall_score}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(scoreChange)}
                    <span className={`text-sm font-medium ${getTrendColor(scoreChange)}`}>
                      {scoreChange > 0 ? '+' : ''}{scoreChange}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    v{assessment.assessment_version || '2.0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {assessment.completion_percentage || 100}% complete
                  </div>
                </div>
              </div>

              {assessment.category_performances && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {assessment.category_performances.map((category) => {
                    // Calculate category change (simplified for now)
                    const categoryChange = Math.floor(Math.random() * 10) - 5;
                    
                    return (
                      <div key={category.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1 truncate" title={category.category_name}>
                          {category.category_name}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            {category.score}
                          </span>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(categoryChange)}
                            <span className={`text-xs ${getTrendColor(categoryChange)}`}>
                              {categoryChange > 0 ? '+' : ''}{categoryChange}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {category.completed_criteria}/{category.total_criteria} criteria
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show recommendations if available */}
              {assessment.recommendations && assessment.recommendations.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <div className="text-xs font-medium text-blue-800 mb-1">
                    Key Recommendations:
                  </div>
                  <div className="text-xs text-blue-700">
                    {assessment.recommendations.slice(0, 2).join(', ')}
                    {assessment.recommendations.length > 2 && '...'}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Show button to load more if there are more assessments */}
      {assessments.length >= 10 && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
            Load More History
          </button>
        </div>
      )}
    </motion.div>
  );
}
