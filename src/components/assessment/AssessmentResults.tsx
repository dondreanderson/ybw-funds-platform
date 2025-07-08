'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';

export function AssessmentResults() {
  const { state, resetAssessment } = useAssessment();
  const router = useRouter();

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', label: 'Excellent', color: 'text-green-600' };
    if (score >= 80) return { grade: 'B', label: 'Good', color: 'text-blue-600' };
    if (score >= 70) return { grade: 'C', label: 'Fair', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'D', label: 'Poor', color: 'text-orange-600' };
    return { grade: 'F', label: 'Very Poor', color: 'text-red-600' };
  };

  const gradeInfo = getGrade(state.currentScore);

 const getRecommendations = (): Array<{
  category: string;
  title: string;
  description: string;
  priority: string;
  estimatedImpact: string;
}> => {
  const recommendations: Array<{
    category: string;
    title: string;
    description: string;
    priority: string;
    estimatedImpact: string;
  }> = [];
  
  Object.entries(state.categoryScores).forEach(([category, score]) => {
    if (score < 70) {
      switch (category) {
        case 'Business Foundation':
          recommendations.push({
            category,
            title: 'Strengthen Business Foundation',
            description: 'Complete business registration and establish core infrastructure',
            priority: 'High',
            estimatedImpact: '+15-25 points'
          });
          break;
        case 'Banking & Finance':
          recommendations.push({
            category,
            title: 'Improve Banking Relationships',
            description: 'Open business accounts and establish financial tracking',
            priority: 'Critical',
            estimatedImpact: '+20-30 points'
          });
          break;
        case 'Business Credit Profile':
          recommendations.push({
            category,
            title: 'Build Business Credit',
            description: 'Establish trade accounts and monitor credit reports',
            priority: 'High',
            estimatedImpact: '+25-35 points'
          });
          break;
        default:
          recommendations.push({
            category,
            title: `Improve ${category}`,
            description: `Focus on enhancing your ${category.toLowerCase()} practices`,
            priority: 'Medium',
            estimatedImpact: '+10-20 points'
          });
      }
    }
  });

  return recommendations.slice(0, 5); // Top 5 recommendations
};

  const recommendations = getRecommendations();

  const handleReturnToDashboard = () => {
    resetAssessment();
    router.push('/dashboard');
  };

  const handleTakeAgain = () => {
    resetAssessment();
    router.push('/assessment');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assessment Complete! 🎉
        </h1>
        <p className="text-gray-600">
          Here's your comprehensive fundability analysis and recommendations
        </p>
      </div>

      {/* Score Overview */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Fundability Score
            </h2>
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
              <span className={`text-6xl font-bold ${gradeInfo.color}`}>
                {state.currentScore}
              </span>
              <div>
                <p className={`text-xl font-semibold ${gradeInfo.color}`}>
                  Grade: {gradeInfo.grade}
                </p>
                <p className="text-gray-600">{gradeInfo.label}</p>
              </div>
            </div>
            <p className="text-gray-600">
              Based on {Object.keys(state.responses).length} questions across {Object.keys(state.categoryScores).length} categories
            </p>
          </div>
          
          <div className="flex justify-center">
            <ScoreGauge score={state.currentScore} size={250} />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(state.categoryScores).map(([category, score]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{category}</h4>
                <span className={`font-bold ${getGrade(score).color}`}>
                  {Math.round(score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(score, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getGrade(score).label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          🎯 Personalized Recommendations
        </h3>
        
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {rec.estimatedImpact}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{rec.description}</p>
                <p className="text-sm text-gray-500">Category: {rec.category}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌟</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Excellent Work!
            </h4>
            <p className="text-gray-600">
              Your business is in great shape across all categories. Keep up the excellent work!
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleReturnToDashboard}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Dashboard
          </button>
          <button
            onClick={handleTakeAgain}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Take Assessment Again
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