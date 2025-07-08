'use client';

import React, { useEffect } from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';
import { assessmentQuestions } from '@/data/assessmentQuestions';
import { QuestionCard } from './QuestionCard';
import { AssessmentProgress } from './AssessmentProgress';
import { AssessmentNavigation } from './AssessmentNavigation';
import { ScoreTracker } from './ScoreTracker';

export function AssessmentWizard() {
  const { state, dispatch } = useAssessment();

  useEffect(() => {
    // Initialize assessment with questions
    dispatch({ type: 'INITIALIZE', questions: assessmentQuestions });
  }, [dispatch]);

  if (state.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Fundability Assessment
        </h1>
        <p className="text-gray-600">
          Answer questions about your business to get your comprehensive fundability score
        </p>
      </div>

      {/* Progress Bar */}
      <AssessmentProgress
        currentStep={state.currentStep}
        totalSteps={state.totalSteps}
        score={state.currentScore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Question Area */}
        <div className="lg:col-span-2">
          <QuestionCard
            question={currentQuestion}
            value={state.responses[currentQuestion.id]}
            onChange={(value) => {
              // This will be handled by context
            }}
          />
          
          <AssessmentNavigation
            currentStep={state.currentStep}
            totalSteps={state.totalSteps}
            canGoNext={state.responses[currentQuestion.id] !== undefined}
            isComplete={state.isComplete}
          />
        </div>

        {/* Score Tracker Sidebar */}
        <div className="lg:col-span-1">
          <ScoreTracker
            currentScore={state.currentScore}
            categoryScores={state.categoryScores}
            completedQuestions={Object.keys(state.responses).length}
            totalQuestions={state.totalSteps}
          />
        </div>
      </div>
    </div>
  );
}