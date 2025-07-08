'use client';

import React from 'react';
import { useAssessment } from '@/contexts/AssessmentContext';
import type { AssessmentQuestion } from '@/contexts/AssessmentContext';

interface QuestionCardProps {
  question: AssessmentQuestion;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const { setResponse } = useAssessment();

  const handleChange = (newValue: any) => {
    setResponse(question.id, newValue);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-3">
          {question.category}
        </span>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-gray-600 text-sm">{question.helpText}</p>
        )}
      </div>

      <div className="space-y-3">
        {question.type === 'boolean' && (
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === true}
                onChange={() => handleChange(true)}
                className="mr-2 text-blue-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === false}
                onChange={() => handleChange(false)}
                className="mr-2 text-blue-600"
              />
              <span>No</span>
            </label>
          </div>
        )}

        {question.type === 'select' && (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {question.type === 'number' && (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a number..."
          />
        )}

        {question.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your response..."
          />
        )}
      </div>
    </div>
  );
}
