'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Edit, Send, FileText, TrendingUp } from 'lucide-react';
import { AssessmentData } from '@/types/assessment';
import { calculatePreviewScore, getScoreGrade } from '@/lib/assessment/logic';

interface ReviewSubmitProps {
  data: AssessmentData;
  onSubmit: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  isLast: boolean;
}

export function ReviewSubmit({ data, onSubmit, onPrevious, isLoading, isLast }: ReviewSubmitProps) {
  const finalScore = calculatePreviewScore(data);
  const grade = getScoreGrade(finalScore);

  const handleEdit = (stepNumber: number) => {
    // This would normally trigger navigation to a specific step
    console.log(`Edit step ${stepNumber}`);
  };

  const getSectionCompleteness = (sectionData: any) => {
    if (!sectionData) return 0;
    const fields = Object.keys(sectionData);
    const completedFields = fields.filter(key => {
      const value = sectionData[key];
      if (typeof value === 'boolean') return true;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
    return Math.round((completedFields.length / fields.length) * 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Please review your assessment information before submitting
        </p>
      </div>

      {/* Final Score Preview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Your Fundability Score</h3>
            <p className="text-blue-100">
              Based on your assessment responses
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{finalScore}</div>
            <div className="text-blue-100">{grade}</div>
          </div>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="space-y-4 mb-6">
        {/* Business Foundation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">
              <FileText className="inline w-5 h-5 mr-2 text-blue-600" />
              Business Foundation
            </h4>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {getSectionCompleteness(data.businessFoundation)}% Complete
              </div>
              <button
                onClick={() => handleEdit(1)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Business Name:</strong> {data.businessFoundation.businessName || 'Not provided'}
            </div>
            <div>
              <strong>EIN:</strong> {data.businessFoundation.ein || 'Not provided'}
            </div>
            <div>
              <strong>Business Type:</strong> {data.businessFoundation.businessType || 'Not provided'}
            </div>
            <div>
              <strong>Year Established:</strong> {data.businessFoundation.yearEstablished || 'Not provided'}
            </div>
          </div>
        </div>

        {/* Financial Health */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">
              <TrendingUp className="inline w-5 h-5 mr-2 text-green-600" />
              Financial Health
            </h4>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {getSectionCompleteness(data.financialHealth)}% Complete
              </div>
              <button
                onClick={() => handleEdit(2)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Annual Revenue:</strong> ${(data.financialHealth.annualRevenue || 0).toLocaleString()}
            </div>
            <div>
              <strong>Credit Score:</strong> {data.financialHealth.creditScore || 'Not provided'}
            </div>
            <div>
              <strong>Cash Flow:</strong> {data.financialHealth.cashFlow || 'Not provided'}
            </div>
            <div>
              <strong>Profit Margin:</strong> {data.financialHealth.profitMargin || 0}%
            </div>
          </div>
        </div>

        {/* Banking Relationships */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">
              <CheckCircle className="inline w-5 h-5 mr-2 text-purple-600" />
              Banking Relationships
            </h4>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {getSectionCompleteness(data.bankingRelationships)}% Complete
              </div>
              <button
                onClick={() => handleEdit(3)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Primary Bank:</strong> {data.bankingRelationships.primaryBank || 'Not provided'}
            </div>
            <div>
              <strong>Banking Years:</strong> {data.bankingRelationships.bankingYears || 0}
            </div>
            <div>
              <strong>Business Accounts:</strong> {data.bankingRelationships.accountsOpen || 0}
            </div>
            <div>
              <strong>Average Balance:</strong> ${(data.bankingRelationships.averageBalance || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Digital Presence */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">
              <CheckCircle className="inline w-5 h-5 mr-2 text-orange-600" />
              Digital Presence
            </h4>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {getSectionCompleteness(data.digitalPresence)}% Complete
              </div>
              <button
                onClick={() => handleEdit(4)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Has Website:</strong> {data.digitalPresence.hasWebsite ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Google Business:</strong> {data.digitalPresence.hasGoogleBusiness ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Social Media:</strong> {data.digitalPresence.hasSocialMedia ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Online Reviews:</strong> {data.digitalPresence.onlineReviews || 0}
            </div>
          </div>
        </div>

        {/* Industry Operations */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">
              <CheckCircle className="inline w-5 h-5 mr-2 text-red-600" />
              Industry & Operations
            </h4>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                {getSectionCompleteness(data.industryOperations)}% Complete
              </div>
              <button
                onClick={() => handleEdit(5)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Industry:</strong> {data.industryOperations.industry || 'Not provided'}
            </div>
            <div>
              <strong>NAICS Code:</strong> {data.industryOperations.naicsCode || 'Not provided'}
            </div>
            <div>
              <strong>Employees:</strong> {data.industryOperations.numberOfEmployees || 0}
            </div>
            <div>
              <strong>Has Insurance:</strong> {data.industryOperations.hasInsurance ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Agreement */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          Before You Submit
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Please review all information for accuracy</li>
          <li>• Your assessment results will be generated based on this information</li>
          <li>• You can return to edit any section before submitting</li>
          <li>• Once submitted, you'll receive detailed recommendations and next steps</li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isLoading}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <motion.button
          onClick={onSubmit}
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Assessment
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}