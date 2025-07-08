'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  industry: string;
  businessSize: string;
  fundingGoal: string;
  fundingTimeline: string;
  location: string;
  currentRevenue: string;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    industry: '',
    businessSize: '',
    fundingGoal: '',
    fundingTimeline: '',
    location: '',
    currentRevenue: ''
  });

  const steps = [
    {
      title: 'Tell us about your business',
      subtitle: 'Help us personalize your experience',
      fields: [
        {
          key: 'industry',
          label: 'What industry are you in?',
          type: 'select',
          options: [
            '', 'Technology', 'Retail', 'Healthcare', 'Manufacturing', 
            'Professional Services', 'Construction', 'Food & Beverage',
            'Transportation', 'Real Estate', 'Other'
          ]
        },
        {
          key: 'businessSize',
          label: 'How many employees do you have?',
          type: 'select',
          options: [
            '', 'Just me (1)', 'Small team (2-10)', 'Medium (11-50)', 
            'Large (51-200)', 'Enterprise (200+)'
          ]
        }
      ]
    },
    {
      title: 'Your funding goals',
      subtitle: 'What are you looking to achieve?',
      fields: [
        {
          key: 'fundingGoal',
          label: 'What\'s your primary funding goal?',
          type: 'select',
          options: [
            '', 'Working Capital', 'Equipment Purchase', 'Business Expansion',
            'Inventory Financing', 'Real Estate', 'Debt Consolidation',
            'Marketing & Growth', 'Other'
          ]
        },
        {
          key: 'fundingTimeline',
          label: 'When do you need funding?',
          type: 'select',
          options: [
            '', 'ASAP (within 30 days)', 'Within 3 months', 
            'Within 6 months', 'Within 1 year', 'Just exploring options'
          ]
        }
      ]
    },
    {
      title: 'Business details',
      subtitle: 'A few more details to complete your profile',
      fields: [
        {
          key: 'location',
          label: 'Where is your business located?',
          type: 'select',
          options: [
            '', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Other'
          ]
        },
        {
          key: 'currentRevenue',
          label: 'What\'s your approximate annual revenue?',
          type: 'select',
          options: [
            '', 'Pre-revenue', 'Less than $50K', '$50K - $100K', 
            '$100K - $250K', '$250K - $500K', '$500K - $1M', 
            '$1M - $5M', '$5M+'
          ]
        }
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Save onboarding data
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = {
      ...currentUser,
      onboardingData: data,
      onboardingCompleted: true,
      profileCompleteness: 65 // Calculate based on data provided
    };
    
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const updateData = (key: string, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const isStepComplete = () => {
    return currentStepData.fields.every(field => data[field.key as keyof OnboardingData]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to YBW Funds! 🎉</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">{currentStepData.subtitle}</p>
          </div>

          <div className="space-y-6">
            {currentStepData.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <select
                  value={data[field.key as keyof OnboardingData]}
                  onChange={(e) => updateData(field.key, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option || 'Select an option...'}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
