'use client';

import React from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';
import { useRouter } from 'next/navigation';

interface AssessmentNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  isComplete: boolean;
}

export function AssessmentNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  isComplete
}: AssessmentNavigationProps) {
  const { nextStep, prevStep, completeAssessment, state } = useAssessment();
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      nextStep();
    } else {
      // Last question - complete assessment
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await completeAssessment();
    router.push('/assessment/results');
  };

  const isLastQuestion = currentStep === totalSteps - 1;
  const isFirstQuestion = currentStep === 0;

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <button
          onClick={prevStep}
          disabled={isFirstQuestion}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isFirstQuestion
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← Previous
        </button>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i <= currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Next/Complete Button */}
        <button
          onClick={handleNext}
          disabled={!canGoNext || state.loading}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            !canGoNext || state.loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isLastQuestion
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {state.loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : isLastQuestion ? (
            'Complete Assessment →'
          ) : (
            'Next →'
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {!canGoNext && 'Please answer the question to continue'}
          {canGoNext && !isLastQuestion && 'Click Next to continue or Previous to go back'}
          {canGoNext && isLastQuestion && 'Ready to complete your assessment!'}
        </p>
      </div>
    </div>
  );
}