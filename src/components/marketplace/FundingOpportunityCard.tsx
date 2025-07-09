'use client';

import React, { useState } from 'react';
import { FundingOpportunity, UserProfile } from '@/lib/services/opportunityService';

interface FundingOpportunityCardProps {
  opportunity: FundingOpportunity;
  isSelected: boolean;
  onCompareToggle: () => void;
  userProfile: UserProfile;
}

export function FundingOpportunityCard({ 
  opportunity, 
  isSelected, 
  onCompareToggle, 
  userProfile 
}: FundingOpportunityCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getEligibilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getEligibilityText = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProductTypeIcon = (type: string) => {
    const icons = {
      'term_loan': '📋',
      'line_of_credit': '💳',
      'equipment_financing': '🏭',
      'invoice_factoring': '📄',
      'merchant_cash_advance': '💰',
      'sba_loan': '🏛️'
    };
    return icons[type] || '💰';
  };

  const getProductTypeName = (type: string) => {
    const names = {
      'term_loan': 'Term Loan',
      'line_of_credit': 'Line of Credit',
      'equipment_financing': 'Equipment Financing',
      'invoice_factoring': 'Invoice Factoring',
      'merchant_cash_advance': 'Merchant Cash Advance',
      'sba_loan': 'SBA Loan'
    };
    return names[type] || type;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{getProductTypeIcon(opportunity.productType)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{opportunity.lenderName}</h3>
              <p className="text-gray-600">{getProductTypeName(opportunity.productType)}</p>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < Math.floor(opportunity.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {opportunity.rating} ({opportunity.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {opportunity.promoted && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEligibilityColor(opportunity.eligibilityScore)}`}>
              {getEligibilityText(opportunity.eligibilityScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Key Details */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Loan Amount</div>
            <div className="font-semibold text-gray-900">
              {formatCurrency(opportunity.minAmount)} - {formatCurrency(opportunity.maxAmount)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Interest Rate</div>
            <div className="font-semibold text-gray-900">
              {opportunity.interestRateMin}% - {opportunity.interestRateMax}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Term</div>
            <div className="font-semibold text-gray-900">
              {opportunity.termMonthsMin} - {opportunity.termMonthsMax} months
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Approval Time</div>
            <div className="font-semibold text-gray-900">{opportunity.avgApprovalTime}</div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{opportunity.description}</p>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Why this matches you:</div>
          <p className="text-sm text-blue-600">{opportunity.recommendationReason}</p>
        </div>

        {/* Requirements Check */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Requirements Check:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center">
              <span className={`text-sm ${
                userProfile.creditScore >= opportunity.minCreditScore ? 'text-green-600' : 'text-red-600'
              }`}>
                {userProfile.creditScore >= opportunity.minCreditScore ? '✅' : '❌'}
              </span>
              <span className="text-sm text-gray-700 ml-2">
                Credit Score: {opportunity.minCreditScore}+ (You have {userProfile.creditScore})
              </span>
            </div>
            <div className="flex items-center">
              <span className={`text-sm ${
                userProfile.timeInBusiness >= opportunity.minTimeInBusiness ? 'text-green-600' : 'text-red-600'
              }`}>
                {userProfile.timeInBusiness >= opportunity.minTimeInBusiness ? '✅' : '❌'}
              </span>
              <span className="text-sm text-gray-700 ml-2">
                Time in Business: {opportunity.minTimeInBusiness}+ months
              </span>
            </div>
            <div className="flex items-center">
              <span className={`text-sm ${
                userProfile.annualRevenue >= opportunity.minAnnualRevenue ? 'text-green-600' : 'text-red-600'
              }`}>
                {userProfile.annualRevenue >= opportunity.minAnnualRevenue ? '✅' : '❌'}
              </span>
              <span className="text-sm text-gray-700 ml-2">
                Annual Revenue: {formatCurrency(opportunity.minAnnualRevenue)}+
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                {opportunity.requiresPersonalGuarantee ? '⚠️' : '✅'}
              </span>
              <span className="text-sm text-gray-700 ml-2">
                {opportunity.requiresPersonalGuarantee ? 'Personal Guarantee Required' : 'No Personal Guarantee'}
              </span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Key Features:</div>
          <div className="flex flex-wrap gap-2">
            {opportunity.features.map((feature, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => window.open(opportunity.applicationUrl, '_blank')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Now
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            {showDetails ? 'Hide Details' : 'More Details'}
          </button>
          <button
            onClick={onCompareToggle}
            className={`py-3 px-6 rounded-lg font-medium transition-colors ${
              isSelected 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {isSelected ? 'Remove' : 'Compare'}
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Fees & Costs</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Origination Fee:</span>
                    <span className="text-sm font-medium">
                      {opportunity.fees.originationFee ? `${opportunity.fees.originationFee}%` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maintenance Fee:</span>
                    <span className="text-sm font-medium">
                      {opportunity.fees.maintenanceFee ? `$${opportunity.fees.maintenanceFee}` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Early Payment Penalty:</span>
                    <span className="text-sm font-medium">
                      {opportunity.fees.earlyPaymentPenalty ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Collateral:</span>
                    <span className="text-sm font-medium">
                      {opportunity.requiresCollateral ? 'Required' : 'Not Required'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Personal Guarantee:</span>
                    <span className="text-sm font-medium">
                      {opportunity.requiresPersonalGuarantee ? 'Required' : 'Not Required'}
                    </span>
                  </div>
                  {opportunity.industryRestrictions.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Industry Restrictions:</span>
                      <div className="text-sm font-medium">
                        {opportunity.industryRestrictions.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
