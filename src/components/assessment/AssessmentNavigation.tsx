'use client';

import React from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';

interface AssessmentNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  isComplete: boolean;
  onComplete: () => void;
}

export function AssessmentNavigation({ 
  currentStep, 
  totalSteps, 
  canGoNext, 
  isComplete,
  onComplete 
}: AssessmentNavigationProps) {
  const { nextStep, prevStep } = useAssessment();

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      prevStep();
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={handlePrevious}
        disabled={currentStep === 0}
        className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>

      <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
        Question {currentStep + 1} of {totalSteps}
      </div>

      {isLastStep ? (
        <button
          onClick={onComplete}
          disabled={!canGoNext}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Complete Assessment ✓
        </button>
      ) : (
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      )}
    </div>
  );
}
