'use client';

import React, { useState, useEffect } from 'react';
import { User, AssessmentData, APIResponse } from "../../types/common";

// TypeScript Interfaces
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

  // Helper function to safely convert values to numbers
  const convertToNumber = (value: any): number => {
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === 'number') return value;
    return 0;
  };

  // Calculate total score
  const calculateTotalScore = (): number => {
    let score = 0;
    
    // Safe handling of values
    const yearsInBusiness = convertToNumber(responses.years_in_business);
    const annualRevenue = convertToNumber(responses.annual_revenue);
    const creditScore = convertToNumber(responses.credit_score);
    
    // Years in business scoring
    if (yearsInBusiness >= 5) score += 30;
    else if (yearsInBusiness >= 2) score += 20;
    else score += 10;

    // Revenue scoring
    if (annualRevenue >= 1000000) score += 40;
    else if (annualRevenue >= 500000) score += 30;
    else if (annualRevenue >= 100000) score += 20;
    else score += 10;

    // Credit score scoring
    if (creditScore >= 750) score += 30;
    else if (creditScore >= 700) score += 25;
    else if (creditScore >= 650) score += 20;
    else score += 10;

    return Math.min(100, score);
  };

  const handleSubmitAssessment = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Safe conversion of values
      const yearsInBusiness = convertToNumber(responses.years_in_business);
      const annualRevenue = convertToNumber(responses.annual_revenue);
      const creditScore = convertToNumber(responses.credit_score);

      const assessmentData: AssessmentData = {
        userId: user.id,
        businessType: yearsInBusiness >= 2 ? 'established' : 'startup',
        industry: 'general',
        yearsInBusiness,
        annualRevenue,
        creditScore,
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

  const handleResponseChange = (key: keyof AssessmentResponse, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setResponses(prev => ({
      ...prev,
      [key]: numericValue
    }));
  };

  // Loading state
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const currentScore = calculateTotalScore();
  const yearsValue = responses.years_in_business || 0;
  const revenueValue = responses.annual_revenue || 0;
  const creditValue = responses.credit_score || 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Simple Fundability Calculator</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Assessment completed successfully! Score: {result.data?.score || currentScore}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years in Business *
              </label>
              <input
                type="number"
                value={yearsValue}
                onChange={(e) => handleResponseChange('years_in_business', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter years in business"
                min="0"
                max="100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">How many years has your business been operating?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue ($) *
              </label>
              <input
                type="number"
                value={revenueValue}
                onChange={(e) => handleResponseChange('annual_revenue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter annual revenue"
                min="0"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Your business&apos;s gross annual revenue</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Score *
              </label>
              <input
                type="number"
                value={creditValue}
                onChange={(e) => handleResponseChange('credit_score', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter credit score"
                min="300"
                max="850"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Your personal credit score (300-850)</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Preview</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Years in Business:</span>
                <span className="text-sm font-medium">{yearsValue || 'Not set'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Annual Revenue:</span>
                <span className="text-sm font-medium">
                  {revenueValue ? `$${Number(revenueValue).toLocaleString()}` : 'Not set'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Credit Score:</span>
                <span className="text-sm font-medium">{creditValue || 'Not set'}</span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Estimated Score:</span>
                  <span className="text-lg font-bold text-blue-600">{currentScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Welcome, {user.name || user.email}
          </div>
          
          <button
            onClick={handleSubmitAssessment}
            disabled={loading || !yearsValue || !revenueValue || !creditValue}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Assessment...
              </>
            ) : (
              'Submit Assessment'
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Assessment Results</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.data?.score || currentScore}</div>
                <div className="text-sm text-blue-700">Fundability Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {currentScore >= 80 ? 'Excellent' : 
                   currentScore >= 60 ? 'Good' : 
                   currentScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {yearsValue >= 2 ? 'Established' : 'Startup'}
                </div>
                <div className="text-sm text-gray-600">Business Type</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSimpleCalculator;