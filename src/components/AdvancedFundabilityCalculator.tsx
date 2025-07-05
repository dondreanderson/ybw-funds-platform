'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

// TypeScript interfaces
interface FormData {
  // Business Information
  businessAge: string;
  businessType: string;
  industry: string;
  revenue: string;
  employees: string;

  // Financial Health
  creditScore: string;
  cashFlow: string;
  profitability: string;
  debt: string;

  // Funding Requirements
  fundingAmount: string;
  fundingPurpose: string;
  timeframe: string;
  collateral: string;

  // Management & Operations
  experience: string;
  businessPlan: string;
  marketPosition: string;
  growth: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  fields: Array<{
    name: keyof FormData;
    label: string;
    type: 'select' | 'text' | 'number';
    options?: string[];
    required: boolean;
  }>;
}

interface FundabilityResult {
  score: number;
  grade: string;
  category: string;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

const AdvancedFundabilityCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    businessAge: '',
    businessType: '',
    industry: '',
    revenue: '',
    employees: '',
    creditScore: '',
    cashFlow: '',
    profitability: '',
    debt: '',
    fundingAmount: '',
    fundingPurpose: '',
    timeframe: '',
    collateral: '',
    experience: '',
    businessPlan: '',
    marketPosition: '',
    growth: ''
  });
  const [result, setResult] = useState<FundabilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Form categories configuration
  const categories: Category[] = [
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Tell us about your business basics',
      fields: [
        {
          name: 'businessAge',
          label: 'Business Age',
          type: 'select',
          options: ['Less than 1 year', '1-2 years', '2-5 years', '5-10 years', 'Over 10 years'],
          required: true
        },
        {
          name: 'businessType',
          label: 'Business Type',
          type: 'select',
          options: ['Sole Proprietorship', 'Partnership', 'LLC', 'Corporation', 'S-Corporation'],
          required: true
        },
        {
          name: 'industry',
          label: 'Industry',
          type: 'select',
          options: ['Technology', 'Healthcare', 'Retail', 'Manufacturing', 'Services', 'Construction', 'Food & Beverage', 'Other'],
          required: true
        },
        {
          name: 'revenue',
          label: 'Annual Revenue',
          type: 'select',
          options: ['Under $100K', '$100K-$500K', '$500K-$1M', '$1M-$5M', '$5M-$10M', 'Over $10M'],
          required: true
        },
        {
          name: 'employees',
          label: 'Number of Employees',
          type: 'select',
          options: ['1-5', '6-20', '21-50', '51-100', 'Over 100'],
          required: true
        }
      ]
    },
    {
      id: 'financial-health',
      title: 'Financial Health',
      description: 'Your financial position and creditworthiness',
      fields: [
        {
          name: 'creditScore',
          label: 'Personal Credit Score',
          type: 'select',
          options: ['Below 600', '600-650', '650-700', '700-750', 'Above 750'],
          required: true
        },
        {
          name: 'cashFlow',
          label: 'Monthly Cash Flow',
          type: 'select',
          options: ['Negative', 'Break-even', 'Positive but tight', 'Healthy positive', 'Very strong'],
          required: true
        },
        {
          name: 'profitability',
          label: 'Business Profitability',
          type: 'select',
          options: ['Not profitable', 'Break-even', 'Marginally profitable', 'Profitable', 'Highly profitable'],
          required: true
        },
        {
          name: 'debt',
          label: 'Existing Debt Level',
          type: 'select',
          options: ['No debt', 'Low debt', 'Moderate debt', 'High debt', 'Very high debt'],
          required: true
        }
      ]
    },
    {
      id: 'funding-requirements',
      title: 'Funding Requirements',
      description: 'What you need and how you plan to use it',
      fields: [
        {
          name: 'fundingAmount',
          label: 'Funding Amount Needed',
          type: 'select',
          options: ['Under $50K', '$50K-$100K', '$100K-$250K', '$250K-$500K', '$500K-$1M', 'Over $1M'],
          required: true
        },
        {
          name: 'fundingPurpose',
          label: 'Primary Purpose',
          type: 'select',
          options: ['Working capital', 'Equipment purchase', 'Expansion', 'Inventory', 'Real estate', 'Debt consolidation', 'Other'],
          required: true
        },
        {
          name: 'timeframe',
          label: 'When do you need funding?',
          type: 'select',
          options: ['Immediately', 'Within 30 days', '1-3 months', '3-6 months', 'Over 6 months'],
          required: true
        },
        {
          name: 'collateral',
          label: 'Available Collateral',
          type: 'select',
          options: ['No collateral', 'Personal assets', 'Business assets', 'Real estate', 'Multiple assets'],
          required: true
        }
      ]
    },
    {
      id: 'management-operations',
      title: 'Management & Operations',
      description: 'Your experience and business operations',
      fields: [
        {
          name: 'experience',
          label: 'Industry Experience',
          type: 'select',
          options: ['Less than 2 years', '2-5 years', '5-10 years', '10-20 years', 'Over 20 years'],
          required: true
        },
        {
          name: 'businessPlan',
          label: 'Business Plan Quality',
          type: 'select',
          options: ['No formal plan', 'Basic plan', 'Detailed plan', 'Professional plan', 'Comprehensive with projections'],
          required: true
        },
        {
          name: 'marketPosition',
          label: 'Market Position',
          type: 'select',
          options: ['New entrant', 'Growing presence', 'Established player', 'Market leader', 'Dominant position'],
          required: true
        },
        {
          name: 'growth',
          label: 'Growth Trend',
          type: 'select',
          options: ['Declining', 'Stable', 'Slow growth', 'Moderate growth', 'Rapid growth'],
          required: true
        }
      ]
    }
  ];

  // Calculate fundability score
  const calculateFundability = (): FundabilityResult => {
    let score = 0;
    const strengths: string[] = [];
    const improvements: string[] = [];

    // Business Age scoring
    const ageScores: { [key: string]: number } = {
      'Less than 1 year': 10,
      '1-2 years': 20,
      '2-5 years': 30,
      '5-10 years': 40,
      'Over 10 years': 50
    };
    score += ageScores[formData.businessAge] || 0;
    if (formData.businessAge === 'Over 10 years') {
      strengths.push('Established business with long track record');
    } else if (formData.businessAge === 'Less than 1 year') {
      improvements.push('Build business history and track record');
    }

    // Revenue scoring
    const revenueScores: { [key: string]: number } = {
      'Under $100K': 5,
      '$100K-$500K': 15,
      '$500K-$1M': 25,
      '$1M-$5M': 35,
      '$5M-$10M': 45,
      'Over $10M': 50
    };
    score += revenueScores[formData.revenue] || 0;
    if (formData.revenue === 'Over $10M') {
      strengths.push('Strong revenue demonstrates business viability');
    } else if (formData.revenue === 'Under $100K') {
      improvements.push('Focus on increasing revenue streams');
    }

    // Credit Score scoring
    const creditScores: { [key: string]: number } = {
      'Below 600': 5,
      '600-650': 15,
      '650-700': 25,
      '700-750': 35,
      'Above 750': 45
    };
    score += creditScores[formData.creditScore] || 0;
    if (formData.creditScore === 'Above 750') {
      strengths.push('Excellent credit score enhances funding options');
    } else if (formData.creditScore === 'Below 600') {
      improvements.push('Improve personal credit score before applying');
    }

    // Cash Flow scoring
    const cashFlowScores: { [key: string]: number } = {
      'Negative': 0,
      'Break-even': 10,
      'Positive but tight': 20,
      'Healthy positive': 35,
      'Very strong': 45
    };
    score += cashFlowScores[formData.cashFlow] || 0;
    if (formData.cashFlow === 'Very strong') {
      strengths.push('Strong cash flow indicates good financial management');
    } else if (formData.cashFlow === 'Negative') {
      improvements.push('Address cash flow issues before seeking funding');
    }

    // Profitability scoring
    const profitScores: { [key: string]: number } = {
      'Not profitable': 0,
      'Break-even': 10,
      'Marginally profitable': 20,
      'Profitable': 35,
      'Highly profitable': 45
    };
    score += profitScores[formData.profitability] || 0;
    if (formData.profitability === 'Highly profitable') {
      strengths.push('High profitability demonstrates business efficiency');
    }

    // Experience scoring
    const expScores: { [key: string]: number } = {
      'Less than 2 years': 5,
      '2-5 years': 15,
      '5-10 years': 25,
      '10-20 years': 35,
      'Over 20 years': 40
    };
    score += expScores[formData.experience] || 0;
    if (formData.experience === 'Over 20 years') {
      strengths.push('Extensive industry experience reduces lender risk');
    }

    // Business Plan scoring
    const planScores: { [key: string]: number } = {
      'No formal plan': 0,
      'Basic plan': 10,
      'Detailed plan': 20,
      'Professional plan': 30,
      'Comprehensive with projections': 40
    };
    score += planScores[formData.businessPlan] || 0;
    if (formData.businessPlan === 'No formal plan') {
      improvements.push('Develop a comprehensive business plan');
    }

    // Determine grade and category
    let grade: string;
    let category: string;

    if (score >= 300) {
      grade = 'A+';
      category = 'Excellent';
    } else if (score >= 250) {
      grade = 'A';
      category = 'Very Good';
    } else if (score >= 200) {
      grade = 'B+';
      category = 'Good';
    } else if (score >= 150) {
      grade = 'B';
      category = 'Fair';
    } else if (score >= 100) {
      grade = 'C';
      category = 'Poor';
    } else {
      grade = 'D';
      category = 'Very Poor';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (score < 200) {
      recommendations.push('Consider alternative funding options like merchant cash advances');
      recommendations.push('Work on improving credit score and cash flow');
      recommendations.push('Develop a stronger business plan with financial projections');
    } else if (score < 300) {
      recommendations.push('You qualify for most traditional funding options');
      recommendations.push('Consider SBA loans for favorable terms');
      recommendations.push('Prepare detailed financial documentation');
    } else {
      recommendations.push('You qualify for premium funding options');
      recommendations.push('Consider multiple lenders to get the best terms');
      recommendations.push('You may qualify for unsecured funding options');
    }

    return {
      score,
      grade,
      category,
      recommendations,
      strengths,
      improvements
    };
  };

  // Handle form input changes
  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsCalculating(true);

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const calculatedResult = calculateFundability();
    setResult(calculatedResult);
    setIsCalculating(false);
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current step is complete
  const isStepComplete = (stepIndex: number): boolean => {
    const category = categories[stepIndex];
    return category.fields.every(field => 
      !field.required || formData[field.name] !== ''
    );
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      businessAge: '',
      businessType: '',
      industry: '',
      revenue: '',
      employees: '',
      creditScore: '',
      cashFlow: '',
      profitability: '',
      debt: '',
      fundingAmount: '',
      fundingPurpose: '',
      timeframe: '',
      collateral: '',
      experience: '',
      businessPlan: '',
      marketPosition: '',
      growth: ''
    });
    setCurrentStep(0);
    setResult(null);
  };

  // Render form field
  const renderField = (field: Category['fields'][0]) => {
    const value = formData[field.name];

    return (
      <div key={field.name} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === 'select' && field.options ? (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={field.required}
          />
        )}
      </div>
    );
  };

  // Results component
  const ResultsDisplay: React.FC<{ result: FundabilityResult }> = ({ result }) => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <TrendingUp className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Fundability Score</h2>
        <div className="text-6xl font-bold text-blue-600 mb-2">{result.score}</div>
        <div className="text-xl text-gray-600">Grade: {result.grade} - {result.category}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="text-green-700 text-sm">{strength}</li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Improvements
          </h3>
          <ul className="space-y-2">
            {result.improvements.map((improvement, index) => (
              <li key={index} className="text-yellow-700 text-sm">{improvement}</li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="text-blue-700 text-sm">{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={resetForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Calculate Again
        </button>
      </div>
    </div>
  );

  if (result) {
    return <ResultsDisplay result={result} />;
  }

  if (isCalculating) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculating Your Fundability Score</h2>
        <p className="text-gray-600">Analyzing your business profile...</p>
      </div>
    );
  }

  const currentCategory = categories[currentStep];
  const progress = ((currentStep + 1) / categories.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-200 h-2">
        <div 
          className="bg-blue-600 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Fundability Calculator</h1>
            <p className="text-gray-600 mt-1">Step {currentStep + 1} of {categories.length}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-lg font-semibold text-blue-600">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === currentStep
                  ? 'bg-blue-100 text-blue-800'
                  : index < currentStep
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className={`w-4 h-4 rounded-full border-2 ${
                  index === currentStep ? 'border-blue-600' : 'border-gray-400'
                }`}></div>
              )}
              <span className="hidden sm:inline">{category.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{currentCategory.title}</h2>
          <p className="text-gray-600">{currentCategory.description}</p>
        </div>

        <div className="space-y-6">
          {currentCategory.fields.map(renderField)}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep === categories.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepComplete(currentStep)}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                isStepComplete(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Calculate Score
              <TrendingUp className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!isStepComplete(currentStep)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isStepComplete(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFundabilityCalculator;