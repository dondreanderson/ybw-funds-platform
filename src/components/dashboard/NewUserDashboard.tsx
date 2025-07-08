'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface NewUserDashboardProps {
  user: {
    name: string;
    businessName: string;
    calculatorResults?: {
      score: number;
      recommendations: string[];
      completedAt: string;
    };
    onboardingData?: any;
    profileCompleteness: number;
  };
}

export function NewUserDashboard({ user }: NewUserDashboardProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          🎉 Welcome, {user.name}!
        </h1>
        <p className="opacity-90">
          Your account is set up and ready to go. Let's improve your fundability score!
        </p>
      </div>

      {/* Profile Progress */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Profile Setup</h3>
          <span className="text-sm text-gray-500">
            {user.profileCompleteness}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${user.profileCompleteness}%` }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">✓</span>
            </div>
            <span className="text-green-700">Basic information completed</span>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">✓</span>
            </div>
            <span className="text-blue-700">Initial assessment taken</span>
          </div>
        </div>
      </div>

      {/* Your Baseline Score */}
      {user.calculatorResults && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📊 Your Baseline Score</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-blue-600">{user.calculatorResults.score}</p>
              <p className="text-gray-600">Current Fundability Score</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-sm font-medium">
                {new Date(user.calculatorResults.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800 font-medium mb-2">
              🚀 Ready to improve your score?
            </p>
            <p className="text-yellow-700 text-sm">
              Take our comprehensive 125+ criteria assessment to get detailed insights and boost your fundability score!
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🎯 Recommended Next Steps</h3>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/assessment')}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-between"
          >
            <div className="text-left">
              <p className="font-medium">Take Full Assessment</p>
              <p className="text-sm opacity-90">125+ criteria for detailed analysis</p>
            </div>
            <span className="text-2xl">→</span>
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="w-full bg-white border-2 border-blue-300 text-blue-600 p-4 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-between"
          >
            <div className="text-left">
              <p className="font-medium">Complete Your Profile</p>
              <p className="text-sm opacity-75">Add business details for better recommendations</p>
            </div>
            <span className="text-2xl">→</span>
          </button>
        </div>
      </div>

      {/* Top Recommendations Preview */}
      {user.calculatorResults && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">💡 Your Top Recommendations</h3>
          <div className="space-y-3">
            {user.calculatorResults.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm">{index + 1}</span>
                </div>
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/recommendations')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            View all recommendations →
          </button>
        </div>
      )}
    </div>
  );
}
