'use client';

import React from 'react';

interface AssessmentProgressProps {
  currentStep: number;
  totalSteps: number;
  score: number;
}

export function AssessmentProgress({ currentStep, totalSteps, score }: AssessmentProgressProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Assessment Progress</h3>
        <span className="text-sm text-gray-500">
          {currentStep + 1} of {totalSteps} questions
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Score Display */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Current Score: <span className="font-semibold text-blue-600">{score}/100</span>
        </div>
        <div className="text-sm text-gray-600">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
      
      {/* Score Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
              score >= 80 ? 'bg-green-500' : 
              score >= 60 ? 'bg-yellow-500' : 
              score >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
