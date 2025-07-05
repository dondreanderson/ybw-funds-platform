'use client';

import React, { useState, useEffect } from 'react';

// TypeScript Interfaces
interface User {
  id: string;
  email?: string;
  name?: string;
  profile?: any;
}

interface AssessmentData {
  userId: string;
  businessType: string;
  industry: string;
  yearsInBusiness: number;
  annualRevenue: number;
  creditScore: number;
  responses: any;
  score: number;
  completedAt: string;
}

interface AssessmentResponse {
  years_in_business?: number;
  annual_revenue?: number;
  credit_score?: number;
  [key: string]: any;
}

const EnhancedSimpleCalculator: React.FC = () => {
  // State Management
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState<AssessmentResponse>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Initialize user (replace with your auth logic)
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Mock user - replace with your actual auth
        const mockUser: User = {
          id: 'user_123',
          email: 'user@example.com',
          name: 'John Doe'
        };
        setUser(mockUser);
      } catch (error) {
        console.error('Failed to initialize user:', error);
        setError('Failed to load user data');
      }
    };

    initializeUser();
  }, []);

  const handleSubmitAssessment = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const assessmentData: AssessmentData = {
        userId: user.id,
        businessType: responses.years_in_business >= 2 ? 'established' : 'startup',
        industry: 'general', // Could be enhanced with industry question
        yearsInBusiness: responses.years_in_business || 0,
        annualRevenue: responses.annual_revenue || 0,
        creditScore: responses.credit_score || 0,
        responses,
        score: calculateTotalScore(),
        completedAt: new Date().toISOString()
      };

      const response = await fetch('/api/assessment/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, assessmentData })
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (): number => {
    // Your scoring logic here
    let score = 0;
    
    if (responses.years_in_business >= 5) score += 30;
    else if (responses.years_in_business >= 2) score += 20;
    else score += 10;

    if (responses.annual_revenue >= 1000000) score += 40;
    else if (responses.annual_revenue >= 500000) score += 30;
    else if (responses.annual_revenue >= 100000) score += 20;
    else score += 10;

    if (responses.credit_score >= 750) score += 30;
    else if (responses.credit_score >= 700) score += 25;
    else if (responses.credit_score >= 650) score += 20;
    else score += 10;

    return Math.min(100, score);
  };

  const handleResponseChange = (key: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Enhanced Simple Fundability Calculator</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Assessment completed successfully! Score: {result.data?.score || 'N/A'}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business
          </label>
          <input
            type="number"
            value={responses.years_in_business || ''}
            onChange={(e) => handleResponseChange('years_in_business', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter years in business"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Revenue ($)
          </label>
          <input
            type="number"
            value={responses.annual_revenue || ''}
            onChange={(e) => handleResponseChange('annual_revenue', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter annual revenue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Score
          </label>
          <input
            type="number"
            value={responses.credit_score || ''}
            onChange={(e) => handleResponseChange('credit_score', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter credit score"
            min="300"
            max="850"
          />
        </div>

        <button
          onClick={handleSubmitAssessment}
          disabled={loading || !responses.years_in_business}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing Assessment...' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedSimpleCalculator;
