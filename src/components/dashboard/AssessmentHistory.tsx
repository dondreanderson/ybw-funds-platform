'use client';

import React from 'react';
import type { Assessment } from '@/lib/types/core';

interface AssessmentHistoryProps {
  assessments: Assessment[];
  loading?: boolean;
}

export function AssessmentHistory({ assessments, loading }: AssessmentHistoryProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No assessment history yet</p>
        <p className="text-sm mt-2">Take your first assessment to see your progress here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.slice(0, 5).map((assessment, index) => (
        <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Assessment #{assessments.length - index}</p>
            <p className="text-sm text-gray-600">
              {new Date(assessment.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{assessment.overall_score}</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
        </div>
      ))}
      
      {assessments.length > 5 && (
        <button className="w-full text-blue-600 text-sm hover:text-blue-800">
          View all {assessments.length} assessments
        </button>
      )}
    </div>
  );
}
