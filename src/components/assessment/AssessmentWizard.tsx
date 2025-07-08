'use client';

import React, { useEffect, useState } from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';
import { assessmentQuestions } from '@/data/assessmentQuestions';
import { QuestionCard } from './QuestionCard';
import { AssessmentProgress } from './AssessmentProgress';
import { AssessmentNavigation } from './AssessmentNavigation';
import { ScoreTracker } from './ScoreTracker';
import { AssessmentResults } from './AssessmentResults';
import { useRouter } from 'next/navigation';

export function AssessmentWizard() {
  const { state, dispatch, saveAndUpdateDashboard } = useAssessment();
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize assessment with questions
    dispatch({ type: 'INITIALIZE', questions: assessmentQuestions });
  }, [dispatch]);

  const handleComplete = async () => {
    setShowResults(true);
  };

  const handleSaveAndExit = async () => {
    const success = await saveAndUpdateDashboard();
  router.push('/dashboard');
  };

  if (showResults) {
    return (
      <AssessmentResults
        score={state.currentScore}
        categoryScores={state.categoryScores}
        recommendations={[]} // We'll generate these based on scores
        onClose={() => setShowResults(false)}
        onSaveAndExit={handleSaveAndExit}
      />
    );
  }

  if (state.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentStep];

  return (
    <div className="max-w-7xl mx-auto p-6">
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
      <div className="mb-8">
        <AssessmentProgress
          currentStep={state.currentStep}
          totalSteps={state.totalSteps}
          score={state.currentScore}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Question Area */}
        <div className="lg:col-span-2">
          <QuestionCard
            question={currentQuestion}
            value={state.responses[currentQuestion.id]}
            onChange={() => {}} // Handled by QuestionCard internally
          />
          
          <AssessmentNavigation
            currentStep={state.currentStep}
            totalSteps={state.totalSteps}
            canGoNext={state.responses[currentQuestion.id] !== undefined}
            isComplete={state.isComplete}
            onComplete={handleComplete}
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
