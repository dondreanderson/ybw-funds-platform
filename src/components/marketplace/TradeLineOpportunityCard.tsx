'use client';

import React, { useState } from 'react';
import { TradeLineOpportunity } from '@/lib/services/opportunityService';
import { EnhancedOpportunityService } from '@/lib/services/enhancedOpportunityService';

interface MatchAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  nextSteps: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface TradelineOpportunityCardProps {
  opportunity: TradeLineOpportunity & { matchAnalysis: MatchAnalysis };
  userId: string;
  onApply?: (opportunity: TradeLineOpportunity) => void;
  onSave?: (opportunity: TradeLineOpportunity) => void;
}

export function TradelineOpportunityCard({ opportunity, userId, onApply, onSave }: TradelineOpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getBureauBadgeColor = (bureau: string) => {
    switch (bureau) {
      case 'experian': return 'bg-blue-100 text-blue-800';
      case 'equifax': return 'bg-green-100 text-green-800';
      case 'dun_bradstreet': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMatchGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      await EnhancedOpportunityService.trackOpportunityApplication(userId, opportunity.id, 'tradeline');
      if (onApply) onApply(opportunity);
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
    await EnhancedOpportunityService.trackOpportunityView(userId, opportunity.id, 'tradeline');
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
              <h3 className="text-xl font-semibold text-gray-900">{opportunity.vendorName}</h3>
              {opportunity.promoted && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <p className="text-gray-600">{opportunity.serviceType}</p>
          </div>
          
          {/* Match Score */}
          <div className={`${matchGrade.bg} ${matchGrade.color} px-3 py-2 rounded-lg text-center`}>
            <div className="text-lg font-bold">{matchGrade.grade}</div>
            <div className="text-xs">Match</div>
          </div>
        </div>

        {/* Credit Impact & Bureaus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Credit Building Impact</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(opportunity.creditBuildingImpact)}`}>
              {opportunity.creditBuildingImpact.toUpperCase()} IMPACT
            </span>
            <p className="text-xs text-gray-600 mt-1">{opportunity.estimatedCreditImpact}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Reports To</p>
            <div className="flex flex-wrap gap-1">
              {opportunity.creditReportingBureaus.map((bureau, index) => (
                <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${getBureauBadgeColor(bureau)}`}>
                  {bureau.replace('_', ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Credit Limit</p>
            <p className="font-semibold">
              {formatAmount(opportunity.creditLimit.min)} - {formatAmount(opportunity.creditLimit.max)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Terms</p>
            <p className="font-semibold">{opportunity.paymentTerms}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Setup Fee</p>
            <p className="font-semibold">
              {opportunity.fees.setupFee ? formatAmount(opportunity.fees.setupFee) : 'Free'}
            </p>
          </div>
        </div>

        {/* Quick Benefits */}
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
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
            {/* Eligibility & Strategy */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Credit Building Strategy</h4>
              
              {/* Requirements */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Requirements</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Min Credit Score: <span className="font-medium">{opportunity.minCreditScore || 'None'}</span></p>
                  <p>Time in Business: <span className="font-medium">{opportunity.timeInBusinessMin} months</span></p>
                  <p>Min Revenue: <span className="font-medium">{formatAmount(opportunity.annualRevenueMin)}</span></p>
                </div>
              </div>

              {/* Benefits */}
              {opportunity.benefits.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits</h5>
                  <ul className="space-y-1">
                    {opportunity.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2 text-green-500">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Analysis */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Match Analysis</h4>
              
              {/* Strengths */}
              {opportunity.matchAnalysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-green-700 mb-2">Why This Works</h5>
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
                  <h5 className="text-sm font-medium text-yellow-700 mb-2">Considerations</h5>
                  <ul className="space-y-1">
                    {opportunity.matchAnalysis.concerns.map((concern, index) => (
                      <li key={index} className="text-sm text-yellow-600 flex items-start">
                        <span className="mr-2 mt-0.5">⚠</span>
                        {concern}
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
              <h4 className="font-semibold text-gray-900 mb-3">Expert Recommendations</h4>
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

          {/* Action Plan */}
          {opportunity.matchAnalysis.nextSteps.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Action Plan</h4>
              <ol className="space-y-2">
                {opportunity.matchAnalysis.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2 mt-0.5 bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
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