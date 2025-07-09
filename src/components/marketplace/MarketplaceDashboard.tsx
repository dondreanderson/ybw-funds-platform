'use client';

import React, { useState, useEffect } from 'react';
import { OpportunityService, FundingOpportunity, TradeLineOpportunity, UserProfile } from '@/lib/services/opportunityService';
import { FundingOpportunityCard } from './FundingOpportunityCard';
import { TradeLineOpportunityCard } from './TradeLineOpportunityCard';
import { MarketplaceFilters } from './MarketplaceFilters';
import { OpportunityComparison } from './OpportunityComparison';

interface MarketplaceDashboardProps {
  userProfile: UserProfile;
}

export function MarketplaceDashboard({ userProfile }: MarketplaceDashboardProps) {
  const [activeTab, setActiveTab] = useState<'funding' | 'tradelines'>('funding');
  const [fundingOpportunities, setFundingOpportunities] = useState<FundingOpportunity[]>([]);
  const [tradeLineOpportunities, setTradeLineOpportunities] = useState<TradeLineOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

  useEffect(() => {
    loadOpportunities();
  }, [userProfile]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const funding = OpportunityService.getMatchedFundingOpportunities(userProfile);
      const tradeLines = OpportunityService.getMatchedTradeLineOpportunities(userProfile);
      
      setFundingOpportunities(funding);
      setTradeLineOpportunities(tradeLines);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareToggle = (opportunityId: string) => {
    setSelectedOpportunities(prev => 
      prev.includes(opportunityId) 
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your best opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💰 Funding & Credit Marketplace
        </h1>
        <p className="text-gray-600">
          Discover funding opportunities and trade lines perfectly matched to your business profile
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{fundingOpportunities.length}</div>
          <div className="text-sm text-blue-700">Funding Matches</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{tradeLineOpportunities.length}</div>
          <div className="text-sm text-green-700">Trade Line Matches</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{userProfile.fundabilityScore}</div>
          <div className="text-sm text-purple-700">Your Fundability Score</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {fundingOpportunities.filter(o => o.eligibilityScore >= 80).length}
          </div>
          <div className="text-sm text-orange-700">High Match Opportunities</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('funding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'funding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            💰 Funding Opportunities ({fundingOpportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('tradelines')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tradelines'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏗️ Trade Lines ({tradeLineOpportunities.length})
          </button>
        </nav>
      </div>

      {/* Compare Button */}
      {selectedOpportunities.length > 1 && (
        <div className="mb-6">
          <button
            onClick={() => setShowComparison(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Compare Selected ({selectedOpportunities.length})
          </button>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <MarketplaceFilters
            activeTab={activeTab}
            userProfile={userProfile}
            onFiltersChange={(filters) => {
              // Handle filter changes
              console.log('Filters changed:', filters);
            }}
          />
        </div>

        {/* Opportunities List */}
        <div className="lg:col-span-3">
          {activeTab === 'funding' ? (
            <div className="space-y-6">
              {fundingOpportunities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Funding Matches</h3>
                  <p className="text-gray-600">
                    Improve your fundability score to unlock more opportunities
                  </p>
                </div>
              ) : (
                fundingOpportunities.map((opportunity) => (
                  <FundingOpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isSelected={selectedOpportunities.includes(opportunity.id)}
                    onCompareToggle={() => handleCompareToggle(opportunity.id)}
                    userProfile={userProfile}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {tradeLineOpportunities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏗️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trade Line Matches</h3>
                  <p className="text-gray-600">
                    All businesses can build credit with trade lines
                  </p>
                </div>
              ) : (
                tradeLineOpportunities.map((opportunity) => (
                  <TradeLineOpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    isSelected={selectedOpportunities.includes(opportunity.id)}
                    onCompareToggle={() => handleCompareToggle(opportunity.id)}
                    userProfile={userProfile}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <OpportunityComparison
          opportunities={selectedOpportunities}
          type={activeTab}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
