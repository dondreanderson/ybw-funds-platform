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
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Score</h3>
      
      {/* Overall Score Circle */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-3">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={currentScore >= 80 ? '#10b981' : currentScore >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${currentScore * 2.51} 251`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{currentScore}</span>
          </div>
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(currentScore)}`}>
          Grade: {getGrade(currentScore)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{completedQuestions}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Scores */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Category Breakdown</h4>
        {Object.entries(categoryScores).map(([category, score]) => (
          <div key={category} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">{category}</span>
              <span className="text-gray-900 font-semibold">{Math.round(score)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  score >= 80 ? 'bg-green-500' : 
                  score >= 60 ? 'bg-yellow-500' : 
                  score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Answer all questions for accurate scoring</li>
          <li>• Higher scores improve funding chances</li>
          <li>• Focus on critical business foundations</li>
        </ul>
      </div>
    </div>
  );
}
