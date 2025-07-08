'use client';

import React from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';
import type { AssessmentQuestion } from '@/contexts/AssessmentContext';

interface QuestionCardProps {
  question: AssessmentQuestion;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionCard({ question, value }: QuestionCardProps) {
  const { setResponse } = useAssessment();

  const handleChange = (newValue: any) => {
    setResponse(question.id, newValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {question.category}
          </span>
          {question.isCritical && (
            <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              Critical
            </span>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        
        {question.helpText && (
          <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-lg">
            💡 {question.helpText}
          </p>
        )}
      </div>

      {/* Question Input */}
      <div className="space-y-4">
        {question.type === 'boolean' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleChange(true)}
              className={`p-4 rounded-lg border-2 transition-all ${
                value === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-2">✅</span>
                <span className="font-medium">Yes</span>
              </div>
            </button>
            
            <button
              onClick={() => handleChange(false)}
              className={`p-4 rounded-lg border-2 transition-all ${
                value === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-2">❌</span>
                <span className="font-medium">No</span>
              </div>
            </button>
          </div>
        )}

        {question.type === 'select' && question.options && (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleChange(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  value === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    value === option ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {value === option && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {question.type === 'number' && (
          <div>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter amount..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            />
            {question.id.includes('revenue') && (
              <p className="text-sm text-gray-500 mt-2">
                Enter your annual revenue in dollars (e.g., 250000 for $250,000)
              </p>
            )}
          </div>
        )}

        {question.type === 'text' && (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter your answer..."
            rows={4}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        )}
      </div>

      {/* Current Answer Display */}
      {value !== undefined && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Your answer:</p>
          <p className="font-medium text-gray-900">
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
          </p>
        </div>
      )}
    </div>
  );
}