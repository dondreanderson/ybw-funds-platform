'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FundingOpportunityCard } from './FundingOpportunityCard';
import { TradelineOpportunityCard } from './TradelineOpportunityCard';
import { FundingOpportunity, TradeLineOpportunity } from '@/lib/services/opportunityService';

interface MatchAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  nextSteps: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

type Tab = 'funding' | 'tradelines';

interface FilterState {
  minAmount: number;
  maxAmount: number;
  productTypes: string[];
  creditScoreRange: [number, number];
  riskLevel: string[];
}

export function MarketplaceDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('funding');
  const [fundingOpportunities, setFundingOpportunities] = useState<(FundingOpportunity & { matchAnalysis: MatchAnalysis })[]>([]);
  const [tradelineOpportunities, setTradelineOpportunities] = useState<(TradeLineOpportunity & { matchAnalysis: MatchAnalysis })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minAmount: 0,
    maxAmount: 1000000,
    productTypes: [],
    creditScoreRange: [500, 850],
    riskLevel: []
  });

  useEffect(() => {
    if (session?.user) {
      loadOpportunities();
    }
  }, [session, activeTab]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/opportunities?type=${activeTab}&userId=${session?.user?.id}`);
      const data = await response.json();
      
      if (data.success) {
        if (activeTab === 'funding') {
          setFundingOpportunities(data.opportunities);
        } else {
          setTradelineOpportunities(data.opportunities);
        }
      }
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFunding = async (opportunity: FundingOpportunity) => {
    try {
      await fetch('/api/marketplace/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          opportunityId: opportunity.id,
          type: 'funding'
        })
      });
    } catch (error) {
      console.error('Error tracking application:', error);
    }
  };

  const handleApplyTradeline = async (opportunity: TradeLineOpportunity) => {
    try {
      await fetch('/api/marketplace/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          opportunityId: opportunity.id,
          type: 'tradeline'
        })
      });
    } catch (error) {
      console.error('Error tracking application:', error);
    }
  };

  const handleSave = async (opportunity: FundingOpportunity | TradeLineOpportunity) => {
    try {
      await fetch('/api/marketplace/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          opportunityId: opportunity.id,
          type: activeTab
        })
      });
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const filteredFundingOpportunities = fundingOpportunities.filter(opportunity => {
    if (searchTerm && !opportunity.lenderName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.minAmount > 0 && opportunity.maxAmount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount < 1000000 && opportunity.minAmount > filters.maxAmount) {
      return false;
    }
    if (filters.productTypes.length > 0 && !filters.productTypes.includes(opportunity.productType)) {
      return false;
    }
    if (filters.riskLevel.length > 0 && !filters.riskLevel.includes(opportunity.matchAnalysis.riskLevel)) {
      return false;
    }
    return true;
  });

  const filteredTradelineOpportunities = tradelineOpportunities.filter(opportunity => {
    if (searchTerm && !opportunity.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to access the marketplace</p>
          <button 
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Funding Marketplace</h1>
          <p className="text-gray-600">Discover personalized funding and credit building opportunities</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('funding')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'funding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💰 Funding Opportunities
            </button>
            <button
              onClick={() => setActiveTab('tradelines')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tradelines'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Credit Building
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'funding' ? 'lenders' : 'vendors'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            🔍 Filters
            {showFilters && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">ON</span>}
          </button>
          <button
            onClick={loadOpportunities}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && activeTab === 'funding' && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <select
                  multiple
                  value={filters.productTypes}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, productTypes: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="term_loan">Term Loan</option>
                  <option value="line_of_credit">Line of Credit</option>
                  <option value="sba_loan">SBA Loan</option>
                  <option value="equipment_financing">Equipment Financing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <div className="space-y-2">
                  {['low', 'medium', 'high'].map(risk => (
                    <label key={risk} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.riskLevel.includes(risk)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, riskLevel: [...prev.riskLevel, risk] }));
                          } else {
                            setFilters(prev => ({ ...prev, riskLevel: prev.riskLevel.filter(r => r !== risk) }));
                          }
                        }}
                        className="mr-2"
                      />
                      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'funding' ? (
              filteredFundingOpportunities.length > 0 ? (
                filteredFundingOpportunities.map((opportunity) => (
                  <FundingOpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    userId={session.user?.id || ''}
                    onApply={handleApplyFunding}
                    onSave={handleSave}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">💼</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No funding opportunities found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              )
            ) : (
              filteredTradelineOpportunities.length > 0 ? (
                filteredTradelineOpportunities.map((opportunity) => (
                  <TradelineOpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    userId={session.user?.id || ''}
                    onApply={handleApplyTradeline}
                    onSave={handleSave}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📈</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tradeline opportunities found</h3>
                  <p className="text-gray-600">Try adjusting your search or take an assessment first</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}