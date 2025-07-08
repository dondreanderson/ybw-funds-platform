'use client';

import React from 'react';

interface ScoreTrackerProps {
  currentScore: number;
  categoryScores: Record<string, number>;
  completedQuestions: number;
  totalQuestions: number;
}

export function ScoreTracker({ 
  currentScore, 
  categoryScores, 
  completedQuestions, 
  totalQuestions 
}: ScoreTrackerProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Score Tracker</h3>
      
      {/* Overall Score */}
      <div className={`text-center p-4 rounded-lg mb-6 ${getScoreBgColor(currentScore)}`}>
        <p className="text-sm text-gray-600 mb-1">Current Fundability Score</p>
        <p className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
          {currentScore}
        </p>
        <p className="text-sm text-gray-600">
          Based on {completedQuestions} of {totalQuestions} questions
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Category Scores</h4>
        
        {Object.entries(categoryScores).map(([category, score]) => (
          <div key={category} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 truncate">
                {category}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                {Math.round(score)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(score, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        {Object.keys(categoryScores).length === 0 && (
          <p className="text-sm text-gray-500 italic">
            Start answering questions to see category breakdowns
          </p>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Quick Tips</h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Answer all questions for accurate scoring</li>
          <li>• Critical questions have higher impact</li>
          <li>• You can go back to change answers</li>
        </ul>
      </div>
    </div>
  );
}