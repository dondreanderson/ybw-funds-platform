'use client';

import React, { useState, useEffect } from 'react';

interface FilterState {
  // Funding Filters
  loanAmount: { min: number; max: number };
  interestRate: { min: number; max: number };
  creditScore: { min: number; max: number };
  timeInBusiness: number;
  annualRevenue: number;
  productTypes: string[];
  industryRestrictions: string[];
  requiresCollateral: boolean | null;
  requiresPersonalGuarantee: boolean | null;
  approvalTimeframe: string[];
  
  // Tradeline Filters
  creditImpact: string[];
  reportingBureaus: string[];
  setupFees: { min: number; max: number };
  creditLimits: { min: number; max: number };
  
  // General Filters
  riskLevel: string[];
  matchGrade: string[];
  promoted: boolean | null;
}

interface AdvancedFiltersProps {
  filterType: 'funding' | 'tradelines';
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
}

export function AdvancedFilters({ filterType, onFiltersChange, onClose }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    loanAmount: { min: 1000, max: 5000000 },
    interestRate: { min: 0, max: 50 },
    creditScore: { min: 500, max: 850 },
    timeInBusiness: 0,
    annualRevenue: 0,
    productTypes: [],
    industryRestrictions: [],
    requiresCollateral: null,
    requiresPersonalGuarantee: null,
    approvalTimeframe: [],
    creditImpact: [],
    reportingBureaus: [],
    setupFees: { min: 0, max: 1000 },
    creditLimits: { min: 500, max: 100000 },
    riskLevel: [],
    matchGrade: [],
    promoted: null
  });

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateRangeFilter = (key: string, field: 'min' | 'max', value: number) => {
    setFilters(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof FilterState] as { min: number; max: number },
        [field]: value
      }
    }));
  };

  const toggleArrayFilter = (key: string, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key as keyof FilterState] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      loanAmount: { min: 1000, max: 5000000 },
      interestRate: { min: 0, max: 50 },
      creditScore: { min: 500, max: 850 },
      timeInBusiness: 0,
      annualRevenue: 0,
      productTypes: [],
      industryRestrictions: [],
      requiresCollateral: null,
      requiresPersonalGuarantee: null,
      approvalTimeframe: [],
      creditImpact: [],
      reportingBureaus: [],
      setupFees: { min: 0, max: 1000 },
      creditLimits: { min: 500, max: 100000 },
      riskLevel: [],
      matchGrade: [],
      promoted: null
    });
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Advanced Filters - {filterType === 'funding' ? 'Funding' : 'Credit Building'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Funding Specific Filters */}
            {filterType === 'funding' && (
              <>
                {/* Loan Amount Range */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Loan Amount</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.loanAmount.min}
                        onChange={(e) => updateRangeFilter('loanAmount', 'min', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.loanAmount.max}
                        onChange={(e) => updateRangeFilter('loanAmount', 'max', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      ${filters.loanAmount.min.toLocaleString()} - ${filters.loanAmount.max.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Interest Rate Range */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Interest Rate (%)</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.interestRate.min}
                        onChange={(e) => updateRangeFilter('interestRate', 'min', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        min="0"
                        max="50"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.interestRate.max}
                        onChange={(e) => updateRangeFilter('interestRate', 'max', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        min="0"
                        max="50"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {filters.interestRate.min}% - {filters.interestRate.max}%
                    </div>
                  </div>
                </div>

                {/* Product Types */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Product Types</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'term_loan', label: 'Term Loan' },
                      { value: 'line_of_credit', label: 'Line of Credit' },
                      { value: 'sba_loan', label: 'SBA Loan' },
                      { value: 'equipment_financing', label: 'Equipment Financing' },
                      { value: 'invoice_factoring', label: 'Invoice Factoring' },
                      { value: 'merchant_cash_advance', label: 'Merchant Cash Advance' }
                    ].map(type => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.productTypes.includes(type.value)}
                          onChange={() => toggleArrayFilter('productTypes', type.value)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Requirements</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collateral Required
                      </label>
                      <select
                        value={filters.requiresCollateral === null ? 'any' : filters.requiresCollateral.toString()}
                        onChange={(e) => updateFilter('requiresCollateral', 
                          e.target.value === 'any' ? null : e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="any">Any</option>
                        <option value="false">No Collateral</option>
                        <option value="true">Collateral Required</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personal Guarantee
                      </label>
                      <select
                        value={filters.requiresPersonalGuarantee === null ? 'any' : filters.requiresPersonalGuarantee.toString()}
                        onChange={(e) => updateFilter('requiresPersonalGuarantee', 
                          e.target.value === 'any' ? null : e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="any">Any</option>
                        <option value="false">No Personal Guarantee</option>
                        <option value="true">Personal Guarantee Required</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Approval Timeframe */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Approval Timeframe</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'same_day', label: 'Same Day' },
                      { value: '1_3_days', label: '1-3 Days' },
                      { value: '1_week', label: '1 Week' },
                      { value: '2_weeks', label: '2 Weeks' },
                      { value: '1_month', label: '1 Month+' }
                    ].map(timeframe => (
                      <label key={timeframe.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.approvalTimeframe.includes(timeframe.value)}
                          onChange={() => toggleArrayFilter('approvalTimeframe', timeframe.value)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{timeframe.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tradeline Specific Filters */}
            {filterType === 'tradelines' && (
              <>
                {/* Credit Building Impact */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Credit Building Impact</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'high', label: 'High Impact' },
                      { value: 'medium', label: 'Medium Impact' },
                      { value: 'low', label: 'Low Impact' }
                    ].map(impact => (
                      <label key={impact.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.creditImpact.includes(impact.value)}
                          onChange={() => toggleArrayFilter('creditImpact', impact.value)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{impact.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reporting Bureaus */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Reporting Bureaus</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'experian', label: 'Experian' },
                      { value: 'equifax', label: 'Equifax' },
                      { value: 'dun_bradstreet', label: 'Dun & Bradstreet' }
                    ].map(bureau => (
                      <label key={bureau.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.reportingBureaus.includes(bureau.value)}
                          onChange={() => toggleArrayFilter('reportingBureaus', bureau.value)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{bureau.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Setup Fees */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Setup Fees</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.setupFees.min}
                        onChange={(e) => updateRangeFilter('setupFees', 'min', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.setupFees.max}
                        onChange={(e) => updateRangeFilter('setupFees', 'max', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      ${filters.setupFees.min} - ${filters.setupFees.max}
                    </div>
                  </div>
                </div>

                {/* Credit Limits */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Credit Limits</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.creditLimits.min}
                        onChange={(e) => updateRangeFilter('creditLimits', 'min', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.creditLimits.max}
                        onChange={(e) => updateRangeFilter('creditLimits', 'max', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      ${filters.creditLimits.min.toLocaleString()} - ${filters.creditLimits.max.toLocaleString()}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Universal Filters */}
            {/* Match Grade */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Match Grade</h3>
              <div className="space-y-2">
                {[
                  { value: 'A+', label: 'A+ (Excellent)' },
                  { value: 'A', label: 'A (Very Good)' },
                  { value: 'B+', label: 'B+ (Good)' },
                  { value: 'B', label: 'B (Fair)' },
                  { value: 'C', label: 'C (Poor)' },
                  { value: 'D', label: 'D (Very Poor)' }
                ].map(grade => (
                  <label key={grade.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.matchGrade.includes(grade.value)}
                      onChange={() => toggleArrayFilter('matchGrade', grade.value)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{grade.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Risk Level */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Risk Level</h3>
              <div className="space-y-2">
                {[
                  { value: 'low', label: 'Low Risk' },
                  { value: 'medium', label: 'Medium Risk' },
                  { value: 'high', label: 'High Risk' }
                ].map(risk => (
                  <label key={risk.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.riskLevel.includes(risk.value)}
                      onChange={() => toggleArrayFilter('riskLevel', risk.value)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{risk.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Featured/Promoted */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Special Options</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.promoted === true}
                    onChange={(e) => updateFilter('promoted', e.target.checked ? true : null)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Featured/Promoted Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Reset All
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}