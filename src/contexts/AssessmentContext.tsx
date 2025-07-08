'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AssessmentResponse } from '@/lib/types/core';

export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  type: 'boolean' | 'select' | 'number' | 'text';
  options?: string[];
  required: boolean;
  weight: number;
  isCritical: boolean;
  helpText?: string;
}

export interface AssessmentState {
  currentStep: number;
  totalSteps: number;
  responses: Record<string, any>;
  currentScore: number;
  categoryScores: Record<string, number>;
  isComplete: boolean;
  questions: AssessmentQuestion[];
  loading: boolean;
  error: string | null;
}

type AssessmentAction =
  | { type: 'SET_RESPONSE'; questionId: string; value: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; step: number }
  | { type: 'UPDATE_SCORE'; score: number; categoryScores: Record<string, number> }
  | { type: 'COMPLETE_ASSESSMENT' }
  | { type: 'RESET_ASSESSMENT' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'INITIALIZE'; questions: AssessmentQuestion[] };

const initialState: AssessmentState = {
  currentStep: 0,
  totalSteps: 0,
  responses: {},
  currentScore: 0,
  categoryScores: {},
  isComplete: false,
  questions: [],
  loading: false,
  error: null
};

function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        questions: action.questions,
        totalSteps: action.questions.length,
        currentStep: 0,
        responses: {},
        currentScore: 0,
        categoryScores: {},
        isComplete: false
      };

    case 'SET_RESPONSE':
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.questionId]: action.value
        }
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0)
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.step, state.totalSteps - 1))
      };

    case 'UPDATE_SCORE':
      return {
        ...state,
        currentScore: action.score,
        categoryScores: action.categoryScores
      };

    case 'COMPLETE_ASSESSMENT':
      return {
        ...state,
        isComplete: true
      };

    case 'RESET_ASSESSMENT':
      return {
        ...initialState,
        questions: state.questions,
        totalSteps: state.questions.length
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error
      };

    default:
      return state;
  }
}

interface AssessmentContextType {
  state: AssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
  setResponse: (questionId: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  calculateScore: () => void;
  completeAssessment: () => Promise<void>;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  const setResponse = (questionId: string, value: any) => {
    dispatch({ type: 'SET_RESPONSE', questionId, value });
    // Trigger score calculation after setting response
    setTimeout(() => calculateScore(), 100);
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const prevStep = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const goToStep = (step: number) => {
    dispatch({ type: 'SET_STEP', step });
  };

  const calculateScore = () => {
    const responses = Object.entries(state.responses).map(([questionId, value]) => {
      const question = state.questions.find(q => q.id === questionId);
      if (!question) return null;

      return {
        category: question.category,
        criterionId: question.id,
        criterionName: question.question,
        responseValue: value,
        responseType: question.type,
        pointsEarned: calculateQuestionScore(question, value),
        pointsPossible: 100,
        weightFactor: question.weight,
        isCritical: question.isCritical
      };
    }).filter(Boolean) as AssessmentResponse[];

    // Simple scoring logic - we'll enhance this
    const totalScore = responses.reduce((sum, r) => sum + r.pointsEarned, 0);
    const maxScore = responses.length * 100;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Calculate category scores
    const categoryScores: Record<string, number> = {};
    const categoryGroups = responses.reduce((groups, response) => {
      if (!groups[response.category]) groups[response.category] = [];
      groups[response.category].push(response);
      return groups;
    }, {} as Record<string, AssessmentResponse[]>);

    Object.entries(categoryGroups).forEach(([category, categoryResponses]) => {
      const categoryTotal = categoryResponses.reduce((sum, r) => sum + r.pointsEarned, 0);
      const categoryMax = categoryResponses.length * 100;
      categoryScores[category] = categoryMax > 0 ? (categoryTotal / categoryMax) * 100 : 0;
    });

    dispatch({ type: 'UPDATE_SCORE', score: Math.round(percentage), categoryScores });
  };

  const completeAssessment = async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      
      // Here we would save to database using AssessmentEngine
      // For now, just mark as complete
      dispatch({ type: 'COMPLETE_ASSESSMENT' });
      
      dispatch({ type: 'SET_LOADING', loading: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  };

  const resetAssessment = () => {
    dispatch({ type: 'RESET_ASSESSMENT' });
  };

  return (
    <AssessmentContext.Provider value={{
      state,
      dispatch,
      setResponse,
      nextStep,
      prevStep,
      goToStep,
      calculateScore,
      completeAssessment,
      resetAssessment
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}

// Helper function for scoring individual questions
function calculateQuestionScore(question: AssessmentQuestion, value: any): number {
  switch (question.type) {
    case 'boolean':
      return value === true ? 100 : 0;
      
    case 'select':
      const scoreMap: Record<string, number> = {
        'Excellent': 100,
        'Very Good': 85,
        'Good': 70,
        'Fair': 55,
        'Poor': 25,
        'Yes': 100,
        'No': 0,
        'Corporation': 100,
        'LLC': 85,
        'Partnership': 60,
        'Sole Proprietorship': 40
      };
      return scoreMap[value] || 0;
      
    case 'number':
      if (question.id.includes('revenue')) {
        const revenue = parseFloat(value) || 0;
        if (revenue >= 1000000) return 100;
        if (revenue >= 500000) return 85;
        if (revenue >= 250000) return 70;
        if (revenue >= 100000) return 55;
        if (revenue >= 50000) return 40;
        return 25;
      }
      if (question.id.includes('years') || question.id.includes('time')) {
        const years = parseFloat(value) || 0;
        if (years >= 5) return 100;
        if (years >= 3) return 80;
        if (years >= 2) return 60;
        if (years >= 1) return 40;
        return 20;
      }
      return value > 0 ? 75 : 0;
      
    case 'text':
      return value && value.trim() ? 80 : 0;
      
    default:
      return 0;
  }
}