'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { LenderMatch, Lender, LoanProduct } from '@/types/lender';
import { LenderMatchingService } from '@/lib/lender/matching';

const formatRate = (rate: number) => `${rate.toFixed(1)}%`;
const formatAmount = (amount: number) => `$${amount.toLocaleString()}`;

interface LenderMarketplaceProps {
  assessmentData?: any;
  initialLoanAmount?: number;
  initialLoanType?: string;
}

export function LenderMarketplace({ 
  assessmentData, 
  initialLoanAmount = 100000,
  initialLoanType 
}: LenderMarketplaceProps) {
  
  const [lenderMatches, setLenderMatches] = useState<LenderMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    loanAmount: initialLoanAmount,
    loanType: initialLoanType || 'all',
    maxRate: 15,
    minCreditScore: 500,
    lenderType: 'all',
    processingTime: 'all'
  });
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    if (assessmentData) {
      searchLenders();
    }
  }, [assessmentData, searchFilters]);

  const searchLenders = async () => {
    setLoading(true);
    try {
      const matches = await LenderMatchingService.findMatches(
        assessmentData,
        searchFilters.loanAmount,
        searchFilters.loanType === 'all' ? undefined : searchFilters.loanType,
        20
      );
      setLenderMatches(matches);
    } catch (error) {
      console.error('Error searching lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToLender = (lender: Lender) => {
    setSelectedLender(lender);
    setShowApplicationModal(true);
  };

  //const formatRate = (rate: number) => `${rate.toFixed(1)}%`;
  //const formatAmount = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lender Marketplace
        </h1>
        <p className="text-gray-600">
          Find the best funding options matched to your business profile
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            <FunnelIcon className="inline w-5 h-5 mr-2" />
            Search Filters
          </h2>
          <button
            onClick={searchLenders}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Lenders'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount
            </label>
            <input
              type="number"
              value={searchFilters.loanAmount}
              onChange={(e) => setSearchFilters({
                ...searchFilters,
                loanAmount: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Type
            </label>
            <select
              value={searchFilters.loanType}
              onChange={(e) => setSearchFilters({
                ...searchFilters,
                loanType: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="term_loan">Term Loan</option>
              <option value="line_of_credit">Line of Credit</option>
              <option value="equipment_financing">Equipment Financing</option>
              <option value="working_capital">Working Capital</option>
              <option value="sba_loan">SBA Loan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Rate (%)
            </label>
            <input
              type="number"
              value={searchFilters.maxRate}
              onChange={(e) => setSearchFilters({
                ...searchFilters,
                maxRate: parseFloat(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lender Type
            </label>
            <select
              value={searchFilters.lenderType}
              onChange={(e) => setSearchFilters({
                ...searchFilters,
                lenderType: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="bank">Traditional Bank</option>
              <option value="credit_union">Credit Union</option>
              <option value="online_lender">Online Lender</option>
              <option value="sba_preferred">SBA Preferred</option>
              <option value="alternative">Alternative Lender</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Time
            </label>
            <select
              value={searchFilters.processingTime}
              onChange={(e) => setSearchFilters({
                ...searchFilters,
                processingTime: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Any Time</option>
              <option value="same_day">Same Day</option>
              <option value="1_3_days">1-3 Days</option>
              <option value="3_7_days">3-7 Days</option>
              <option value="1_2_weeks">1-2 Weeks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for the best lenders...</p>
          </div>
        ) : lenderMatches.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {lenderMatches.length} Lenders Found
              </h3>
              <div className="text-sm text-gray-500">
                Sorted by match score
              </div>
            </div>

            {lenderMatches.map((match, index) => (
              <LenderCard
                key={match.lender.id}
                match={match}
                onApply={() => handleApplyToLender(match.lender)}
                rank={index + 1}
              />
            ))}
          </>
        ) : (
          <div className="text-center py-12">
            <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No lenders found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or loan amount
            </p>
            <button
              onClick={() => setSearchFilters({
                ...searchFilters,
                loanAmount: 50000,
                maxRate: 20,
                lenderType: 'all'
              })}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedLender && (
        <ApplicationModal
          lender={selectedLender}
          onClose={() => setShowApplicationModal(false)}
          assessmentData={assessmentData}
          loanAmount={searchFilters.loanAmount}
        />
      )}
    </div>
  );
}

// Lender Card Component
function LenderCard({ match, onApply, rank }: { 
  match: LenderMatch; 
  onApply: () => void;
  rank: number;
}) {
  const { lender } = match;
  
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i}>
        {i < rating ? (
          <StarIconSolid className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ));
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
            {rank}
          </div>
          {lender.logo_url && (
            <img 
              src={lender.logo_url} 
              alt={lender.name}
              className="w-12 h-12 object-contain"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{lender.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                {renderStars(Math.floor(lender.rating))}
              </div>
              <span className="text-sm text-gray-500">
                ({lender.reviews_count} reviews)
              </span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500 capitalize">
                {lender.lender_type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchColor(match.match_score)}`}>
            {Math.round(match.match_score * 100)}% Match
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {Math.round(match.estimated_approval_odds)}% Approval Odds
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{lender.description}</p>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">Rate Range</div>
          <div className="font-semibold">
            {formatRate(match.estimated_rates.min)} - {formatRate(match.estimated_rates.max)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Loan Range</div>
          <div className="font-semibold">
            {formatAmount(lender.min_loan_amount)} - {formatAmount(lender.max_loan_amount)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Min Credit</div>
          <div className="font-semibold">{lender.min_credit_score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Processing</div>
          <div className="font-semibold">{lender.processing_time}</div>
        </div>
      </div>

      {/* Match Reasons */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Why this lender matches:</h4>
        <div className="flex flex-wrap gap-2">
          {match.match_reasons.map((reason, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Recommended Products */}
      {match.recommended_products.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommended Products:</h4>
          <div className="space-y-2">
            {match.recommended_products.slice(0, 2).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatAmount(product.min_amount)} - {formatAmount(product.max_amount)}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {formatRate(product.interest_rate.min)} - {formatRate(product.interest_rate.max)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {lender.contact_info.website && (
            <a
              href={lender.contact_info.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Visit Website
            </a>
          )}
          {lender.contact_info.phone && (
            <a
              href={`tel:${lender.contact_info.phone}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {lender.contact_info.phone}
            </a>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onApply}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Apply Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Application Modal Component
function ApplicationModal({
  lender,
  onClose,
  assessmentData,
  loanAmount
}: {
  lender: Lender;
  onClose: () => void;
  assessmentData: any;
  loanAmount: number;
}) {
  const [applicationData, setApplicationData] = useState({
    requestedAmount: loanAmount,
    loanPurpose: '',
    preferredProduct: '',
    additionalNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit application logic here
    console.log('Submitting application:', applicationData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Apply to {lender.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Loan Amount
              </label>
              <input
                type="number"
                value={applicationData.requestedAmount}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  requestedAmount: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose
              </label>
              <select
                value={applicationData.loanPurpose}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  loanPurpose: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select loan purpose</option>
                <option value="working_capital">Working Capital</option>
                <option value="equipment_purchase">Equipment Purchase</option>
                <option value="inventory">Inventory</option>
                <option value="expansion">Business Expansion</option>
                <option value="marketing">Marketing</option>
                <option value="refinancing">Refinancing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Product
              </label>
              <select
                value={applicationData.preferredProduct}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  preferredProduct: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select preferred product</option>
                {lender.loan_products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={applicationData.additionalNotes}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  additionalNotes: e.target.value
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}