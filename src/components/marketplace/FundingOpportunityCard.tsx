'use client';

import React, { useState } from 'react';
import { FundingOpportunity } from '@/lib/services/opportunityService';
import { EnhancedOpportunityService } from '@/lib/services/enhancedOpportunityService';

interface MatchAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  nextSteps: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface FundingOpportunityCardProps {
  opportunity: FundingOpportunity & { matchAnalysis: MatchAnalysis };
  userId: string;
  onApply?: (opportunity: FundingOpportunity) => void;
  onSave?: (opportunity: FundingOpportunity) => void;
}

export function FundingOpportunityCard({ opportunity, userId, onApply, onSave }: FundingOpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const getMatchGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      await EnhancedOpportunityService.trackOpportunityApplication(userId, opportunity.id, 'funding');
      if (onApply) onApply(opportunity);
      // Open application URL in new tab
      window.open(opportunity.applicationUrl, '_blank');
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (onSave) onSave(opportunity);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleView = async () => {
    await EnhancedOpportunityService.trackOpportunityView(userId, opportunity.id, 'funding');
    setExpanded(!expanded);
  };

  const matchGrade = getMatchGrade(opportunity.matchAnalysis.score);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{opportunity.lenderName}</h3>
              {opportunity.promoted && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <p className="text-gray-600 capitalize">{opportunity.productType.replace('_', ' ')}</p>
          </div>
          
          {/* Match Score */}
          <div className={`${matchGrade.bg} ${matchGrade.color} px-3 py-2 rounded-lg text-center`}>
            <div className="text-lg font-bold">{matchGrade.grade}</div>
            <div className="text-xs">Match</div>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-semibold">
              {formatAmount(opportunity.minAmount)} - {formatAmount(opportunity.maxAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rate</p>
            <p className="font-semibold">
              {formatRate(opportunity.interestRateMin)} - {formatRate(opportunity.interestRateMax)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Term</p>
            <p className="font-semibold">
              {opportunity.termMonthsMin} - {opportunity.termMonthsMax} months
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Approval Time</p>
            <p className="font-semibold">{opportunity.avgApprovalTime}</p>
          </div>
        </div>

        {/* Risk Level */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Risk Level:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.matchAnalysis.riskLevel)}`}>
            {opportunity.matchAnalysis.riskLevel.toUpperCase()}
          </span>
        </div>

        {/* Quick Highlights */}
        <div className="mb-4">
          {opportunity.matchAnalysis.strengths.slice(0, 2).map((strength, index) => (
            <div key={index} className="flex items-center text-green-700 text-sm mb-1">
              <span className="mr-2">✓</span>
              {strength}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Applying...' : 'Apply Now'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Save
          </button>
          <button
            onClick={handleView}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eligibility Analysis */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Eligibility Analysis</h4>
              
              {/* Strengths */}
              {opportunity.matchAnalysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-green-700 mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {opportunity.matchAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-start">
                        <span className="mr-2 mt-0.5">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerns */}
              {opportunity.matchAnalysis.concerns.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-red-700 mb-2">Potential Concerns</h5>
                  <ul className="space-y-1">
                    {opportunity.matchAnalysis.concerns.map((concern, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-start">
                        <span className="mr-2 mt-0.5">⚠</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Requirements & Features */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Requirements & Features</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Minimum Credit Score: <span className="font-medium">{opportunity.minCreditScore}</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time in Business: <span className="font-medium">{opportunity.minTimeInBusiness} months</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Minimum Revenue: <span className="font-medium">{formatAmount(opportunity.minAnnualRevenue)}</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Personal Guarantee: <span className="font-medium">{opportunity.requiresPersonalGuarantee ? 'Required' : 'Not Required'}</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Collateral: <span className="font-medium">{opportunity.requiresCollateral ? 'Required' : 'Not Required'}</span></p>
                </div>
              </div>

              {/* Features */}
              {opportunity.features.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Features</h5>
                  <ul className="space-y-1">
                    {opportunity.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {opportunity.matchAnalysis.recommendations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-300">
              <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {opportunity.matchAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-blue-600 flex items-start">
                    <span className="mr-2 mt-0.5">💡</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {opportunity.matchAnalysis.nextSteps.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Next Steps</h4>
              <ol className="space-y-2">
                {opportunity.matchAnalysis.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2 mt-0.5 bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}