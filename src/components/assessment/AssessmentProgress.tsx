'use client';

import React from 'react';

interface AssessmentProgressProps {
  currentStep: number;
  totalSteps: number;
  score: number;
}

export function AssessmentProgress({ currentStep, totalSteps, score }: AssessmentProgressProps) {
  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assessment Progress</h3>
          <p className="text-gray-600">
            Question {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{score}</p>
          <p className="text-sm text-gray-600">Current Score</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{Math.round(progressPercentage)}% Complete</span>
        <span>{totalSteps - currentStep - 1} questions remaining</span>
      </div>
    </div>
  );
}