// src/components/onboarding/BusinessProfileWizard.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BusinessProfileData {
  businessName: string;
  businessStructure: 'sole_proprietorship' | 'partnership' | 'llc' | 'corporation';
  industry: string;
  yearsFounded: number;
  annualRevenue: number;
  employeeCount: number;
  businessAddress: string;
  businessPhone: string;
  businessWebsite: string;
  hasEIN: boolean;
  hasDUNS: boolean;
  hasBusinessBank: boolean;
  fundingNeeds: {
    amount: number;
    purpose: string;
    timeline: string;
    useOfFunds: string[];
  };
  creditGoals: string[];
}

export function BusinessProfileWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<BusinessProfileData>({
    businessName: '',
    businessStructure: 'llc',
    industry: '',
    yearsFounded: new Date().getFullYear(),
    annualRevenue: 0,
    employeeCount: 1,
    businessAddress: '',
    businessPhone: '',
    businessWebsite: '',
    hasEIN: false,
    hasDUNS: false,
    hasBusinessBank: false,
    fundingNeeds: {
      amount: 50000,
      purpose: 'working_capital',
      timeline: '30_days',
      useOfFunds: []
    },
    creditGoals: []
  });

  const totalSteps = 4;

  const updateProfileData = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateFundingNeeds = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      fundingNeeds: {
        ...prev.fundingNeeds,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        router.push('/marketplace?welcome=true');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Business Basics */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.businessName}
                    onChange={(e) => updateProfileData('businessName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Structure *
                  </label>
                  <select
                    value={profileData.businessStructure}
                    onChange={(e) => updateProfileData('businessStructure', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    value={profileData.industry}
                    onChange={(e) => updateProfileData('industry', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="retail">Retail</option>
                    <option value="food_service">Food Service</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="construction">Construction</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Founded *
                    </label>
                    <input
                      type="number"
                      value={profileData.yearsFounded}
                      onChange={(e) => updateProfileData('yearsFounded', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Count *
                    </label>
                    <select
                      value={profileData.employeeCount}
                      onChange={(e) => updateProfileData('employeeCount', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 (Just me)</option>
                      <option value={5}>2-5 employees</option>
                      <option value={15}>6-15 employees</option>
                      <option value={30}>16-30 employees</option>
                      <option value={100}>31-100 employees</option>
                      <option value={500}>100+ employees</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial Information */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue *
                  </label>
                  <select
                    value={profileData.annualRevenue}
                    onChange={(e) => updateProfileData('annualRevenue', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Less than $25,000</option>
                    <option value={50000}>$25,000 - $75,000</option>
                    <option value={150000}>$75,000 - $250,000</option>
                    <option value={400000}>$250,000 - $500,000</option>
                    <option value={750000}>$500,000 - $1,000,000</option>
                    <option value={2000000}>$1,000,000 - $3,000,000</option>
                    <option value={5000000}>$3,000,000+</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Business Setup Status</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'hasEIN', label: 'Do you have an EIN (Employer Identification Number)?' },
                      { key: 'hasDUNS', label: 'Do you have a DUNS number?' },
                      { key: 'hasBusinessBank', label: 'Do you have a dedicated business bank account?' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData[item.key as keyof BusinessProfileData] as boolean}
                          onChange={(e) => updateProfileData(item.key, e.target.checked)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Funding Needs */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding Needs</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How much funding are you seeking?
                  </label>
                  <select
                    value={profileData.fundingNeeds.amount}
                    onChange={(e) => updateFundingNeeds('amount', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10000}>$10,000 - $25,000</option>
                    <option value={50000}>$25,000 - $75,000</option>
                    <option value={150000}>$75,000 - $250,000</option>
                    <option value={400000}>$250,000 - $500,000</option>
                    <option value={750000}>$500,000 - $1,000,000</option>
                    <option value={1500000}>$1,000,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Purpose
                  </label>
                  <select
                    value={profileData.fundingNeeds.purpose}
                    onChange={(e) => updateFundingNeeds('purpose', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="working_capital">Working Capital</option>
                    <option value="equipment">Equipment Purchase</option>
                    <option value="expansion">Business Expansion</option>
                    <option value="inventory">Inventory</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="debt_consolidation">Debt Consolidation</option>
                    <option value="startup_costs">Startup Costs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When do you need funding?
                  </label>
                  <select
                    value={profileData.fundingNeeds.timeline}
                    onChange={(e) => updateFundingNeeds('timeline', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediately">Immediately</option>
                    <option value="30_days">Within 30 days</option>
                    <option value="90_days">Within 3 months</option>
                    <option value="6_months">Within 6 months</option>
                    <option value="planning">Just planning ahead</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Goals & Completion */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Goals</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    What are your credit building goals? (Select all that apply)
                  </label>
                  <div className="space-y-3">
                    {[
                      'Build business credit from scratch',
                      'Improve existing business credit score',
                      'Separate business from personal credit',
                      'Qualify for better funding terms',
                      'Access higher credit limits',
                      'Establish vendor relationships'
                    ].map(goal => (
                      <label key={goal} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.creditGoals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateProfileData('creditGoals', [...profileData.creditGoals, goal]);
                            } else {
                              updateProfileData('creditGoals', profileData.creditGoals.filter(g => g !== goal));
                            }
                          }}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">🎯 What happens next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• We'll analyze your profile to find the best funding matches</li>
                    <li>• You'll see personalized recommendations in the marketplace</li>
                    <li>• Each opportunity will show your approval likelihood</li>
                    <li>• You can apply directly through our platform</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Profile 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function isStepValid(): boolean {
    switch (currentStep) {
      case 1:
        return profileData.businessName.length > 0 && profileData.industry.length > 0;
      case 2:
        return profileData.annualRevenue > 0;
      case 3:
        return profileData.fundingNeeds.amount > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }
}
