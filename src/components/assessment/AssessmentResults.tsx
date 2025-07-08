'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface AssessmentResultsProps {
  score: number;
  categoryScores: Record<string, number>;
  recommendations: string[];
  onClose: () => void;
  onSaveAndExit: () => void;
}

export function AssessmentResults({ 
  score, 
  categoryScores, 
  recommendations, 
  onClose,
  onSaveAndExit 
}: AssessmentResultsProps) {
  const router = useRouter();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A - Excellent';
    if (score >= 80) return 'B - Good';
    if (score >= 70) return 'C - Fair';
    if (score >= 60) return 'D - Poor';
    return 'F - Very Poor';
  };

  const generateRecommendations = (): string[] => {
    const recs: string[] = [];
    
    // Category-specific recommendations
    Object.entries(categoryScores).forEach(([category, categoryScore]) => {
      if (categoryScore < 70) {
        switch (category) {
          case 'Business Foundation':
            recs.push('Strengthen your business foundation with proper registration and licensing');
            break;
          case 'Banking & Finance':
            recs.push('Improve financial documentation and banking relationships');
            break;
          case 'Business Credit Profile':
            recs.push('Focus on building business credit history and monitoring');
            break;
          case 'Marketing Presence':
            recs.push('Enhance your digital presence and marketing materials');
            break;
          case 'Documentation':
            recs.push('Update and organize essential business documents');
            break;
          default:
            break;
        }
      }
    });

    return recs.length > 0 ? recs : ['Continue maintaining excellent business practices!'];
  };

  const finalRecommendations = generateRecommendations();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <h2 className="text-3xl font-bold mb-2">🎉 Assessment Complete!</h2>
          <p className="text-blue-100">Your comprehensive fundability analysis is ready</p>
        </div>

        <div className="p-6">
          {/* Score Section */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
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
                  stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${score * 2.51} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-gray-900">{score}</span>
                <span className="text-sm text-gray-600">out of 100</span>
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${getScoreColor(score)} mb-2`}>
              {getGrade(score)}
            </h3>
            <p className="text-gray-600">Your Fundability Score</p>
          </div>

          {/* Category Breakdown */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4">Category Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(categoryScores).map(([category, categoryScore]) => (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{category}</span>
                    <span className={`font-bold ${getScoreColor(categoryScore)}`}>
                      {Math.round(categoryScore)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        categoryScore >= 80 ? 'bg-green-500' : 
                        categoryScore >= 60 ? 'bg-yellow-500' : 
                        categoryScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${categoryScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4">📋 Recommended Actions</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {finalRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-blue-800">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onSaveAndExit}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save & Go to Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Download Report
            </button>
            <button
              onClick={() => router.push('/assessment')}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Take New Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
