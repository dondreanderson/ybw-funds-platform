'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Brain,
  BarChart3,
  FileText,
  Award,
  Loader2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TypeScript interfaces
interface User {
  id: string;
  email?: string;
  name?: string;
}

interface CategoryResponse {
  categoryId: string;
  questionId: string;
  response: any;
  score: number;
  maxScore: number;
}

interface AssessmentCategory {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: AssessmentQuestion[];
}

interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'select' | 'boolean' | 'number' | 'text';
  options?: string[];
  required: boolean;
  weight: number;
  maxScore: number;
}

interface AIRecommendation {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number;
  timeframe: string;
}

interface AssessmentResult {
  id: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  grade: string;
  percentile: number;
  recommendations: AIRecommendation[];
  strengths: string[];
  improvements: string[];
  industryComparison?: any;
}

interface BatchResponseService {
  saveBatchResponses: (data: {
    assessmentId: string;
    userId: string;
    responses: CategoryResponse[];
    category: string;
  }) => Promise<void>;
}

// Mock BatchResponseService for now - replace with your actual service
const BatchResponseService: BatchResponseService = {
  saveBatchResponses: async (data) => {
    console.log('Saving batch responses:', data);
    // Your actual implementation here
  }
};

const AdvancedAIFundabilityCalculator: React.FC = () => {
  // State management
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [categoryResponses, setCategoryResponses] = useState<CategoryResponse[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assessment categories configuration
  const assessmentCategories: AssessmentCategory[] = [
    {
      id: 'business_registration',
      title: 'Business Registration & Structure',
      description: 'Legal foundation and business structure assessment',
      weight: 20,
      questions: [
        {
          id: 'business_type',
          text: 'What is your business legal structure?',
          type: 'select',
          options: ['Sole Proprietorship', 'Partnership', 'LLC', 'Corporation', 'S-Corporation'],
          required: true,
          weight: 1,
          maxScore: 20
        },
        {
          id: 'business_age',
          text: 'How long has your business been operating?',
          type: 'select',
          options: ['Less than 1 year', '1-2 years', '2-5 years', '5-10 years', 'Over 10 years'],
          required: true,
          weight: 1,
          maxScore: 20
        },
        {
          id: 'has_ein',
          text: 'Do you have an Employer Identification Number (EIN)?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 15
        },
        {
          id: 'business_licenses',
          text: 'Do you have all required business licenses and permits?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 15
        }
      ]
    },
    {
      id: 'credit_profile',
      title: 'Credit Profile & History',
      description: 'Personal and business credit assessment',
      weight: 25,
      questions: [
        {
          id: 'personal_credit_score',
          text: 'What is your personal credit score range?',
          type: 'select',
          options: ['Below 600', '600-650', '650-700', '700-750', 'Above 750'],
          required: true,
          weight: 1,
          maxScore: 30
        },
        {
          id: 'business_credit_established',
          text: 'Have you established business credit separate from personal credit?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 25
        },
        {
          id: 'payment_history',
          text: 'How would you rate your payment history?',
          type: 'select',
          options: ['Poor - frequent late payments', 'Fair - occasional late payments', 'Good - rarely late', 'Excellent - always on time'],
          required: true,
          weight: 1,
          maxScore: 20
        }
      ]
    },
    {
      id: 'financial_documentation',
      title: 'Financial Documentation',
      description: 'Financial records and documentation quality',
      weight: 20,
      questions: [
        {
          id: 'financial_statements',
          text: 'Do you have current financial statements?',
          type: 'select',
          options: ['No financial statements', 'Basic records', 'Professional statements', 'Audited statements'],
          required: true,
          weight: 1,
          maxScore: 25
        },
        {
          id: 'tax_returns',
          text: 'Are your business tax returns current and filed?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 20
        },
        {
          id: 'cash_flow_positive',
          text: 'Is your business cash flow positive?',
          type: 'select',
          options: ['Negative cash flow', 'Break-even', 'Positive but tight', 'Strong positive cash flow'],
          required: true,
          weight: 1,
          maxScore: 30
        }
      ]
    },
    {
      id: 'operational_infrastructure',
      title: 'Operational Infrastructure',
      description: 'Business operations and infrastructure evaluation',
      weight: 15,
      questions: [
        {
          id: 'business_address',
          text: 'Do you have a dedicated business address?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 15
        },
        {
          id: 'business_phone',
          text: 'Do you have a dedicated business phone line?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 15
        },
        {
          id: 'employee_count',
          text: 'How many employees do you have?',
          type: 'select',
          options: ['Just me', '1-5 employees', '6-20 employees', '21-50 employees', 'Over 50 employees'],
          required: true,
          weight: 1,
          maxScore: 20
        }
      ]
    },
    {
      id: 'online_presence',
      title: 'Digital & Online Presence',
      description: 'Digital footprint and online presence assessment',
      weight: 10,
      questions: [
        {
          id: 'business_website',
          text: 'Do you have a professional business website?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 20
        },
        {
          id: 'social_media_presence',
          text: 'How would you rate your social media presence?',
          type: 'select',
          options: ['No social media', 'Basic presence', 'Active presence', 'Strong professional presence'],
          required: true,
          weight: 1,
          maxScore: 15
        },
        {
          id: 'online_reviews',
          text: 'Do you have positive online reviews?',
          type: 'select',
          options: ['No reviews', 'Few reviews', 'Some positive reviews', 'Many positive reviews'],
          required: true,
          weight: 1,
          maxScore: 15
        }
      ]
    },
    {
      id: 'risk_compliance',
      title: 'Risk & Compliance',
      description: 'Risk factors and compliance assessment',
      weight: 10,
      questions: [
        {
          id: 'business_insurance',
          text: 'Do you have adequate business insurance?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 20
        },
        {
          id: 'industry_risk',
          text: 'How would you classify your industry risk?',
          type: 'select',
          options: ['High risk', 'Moderate risk', 'Low risk', 'Very low risk'],
          required: true,
          weight: 1,
          maxScore: 15
        },
        {
          id: 'regulatory_compliance',
          text: 'Are you compliant with all industry regulations?',
          type: 'boolean',
          required: true,
          weight: 1,
          maxScore: 15
        }
      ]
    }
  ];

  // Initialize assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      // Generate unique assessment ID
      const assessmentId = crypto.randomUUID();
      setCurrentAssessmentId(assessmentId);

      // Get current user (mock for now - replace with your auth)
      const mockUser: User = {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe'
      };
      setUser(mockUser);
    };

    initializeAssessment();
  }, []);

  // Handle response changes
  const handleResponseChange = useCallback((questionId: string, value: any) => {
    const currentCategory = assessmentCategories[currentStep];
    const question = currentCategory.questions.find(q => q.id === questionId);
    
    if (!question) return;

    // Calculate score based on response
    let score = 0;
    if (question.type === 'boolean') {
      score = value === true ? question.maxScore : 0;
    } else if (question.type === 'select' && question.options) {
      const optionIndex = question.options.indexOf(value);
      score = optionIndex >= 0 ? ((optionIndex + 1) / question.options.length) * question.maxScore : 0;
    }

    const response: CategoryResponse = {
      categoryId: currentCategory.id,
      questionId,
      response: value,
      score,
      maxScore: question.maxScore
    };

    setCategoryResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionId);
      return [...filtered, response];
    });
  }, [currentStep, assessmentCategories]);

  // Save responses for current category
  const saveCategoryResponses = useCallback(async () => {
    if (!user || !currentAssessmentId) return;

    const currentCategory = assessmentCategories[currentStep];
    const categoryResponses = getCategoryResponses(currentCategory.id);

    try {
      // Save category responses in batch
      await BatchResponseService.saveBatchResponses({
        assessmentId: currentAssessmentId,
        userId: user.id,
        responses: categoryResponses,
        category: currentCategory.id
      });
    } catch (error) {
      console.error('Failed to save category responses:', error);
      setError('Failed to save responses. Please try again.');
    }
  }, [user, currentAssessmentId, currentStep, categoryResponses]);

  // Get responses for a specific category
  const getCategoryResponses = (categoryId: string): CategoryResponse[] => {
    return categoryResponses.filter(r => r.categoryId === categoryId);
  };

  // Check if current category is complete
  const isCategoryComplete = (categoryIndex: number): boolean => {
    const category = assessmentCategories[categoryIndex];
    const responses = getCategoryResponses(category.id);
    
    return category.questions.every(question => {
      if (!question.required) return true;
      return responses.some(r => r.questionId === question.id && r.response != null);
    });
  };

  // Calculate final assessment
  const calculateAssessment = useCallback(async (): Promise<AssessmentResult> => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const categoryScores: Record<string, number> = {};

    // Calculate scores for each category
    assessmentCategories.forEach(category => {
      const responses = getCategoryResponses(category.id);
      let categoryScore = 0;
      let categoryMaxScore = 0;

      category.questions.forEach(question => {
        const response = responses.find(r => r.questionId === question.id);
        if (response) {
          categoryScore += response.score;
        }
        categoryMaxScore += question.maxScore;
      });

      // Apply category weight
      const weightedScore = (categoryScore / categoryMaxScore) * category.weight;
      categoryScores[category.id] = weightedScore;
      totalScore += weightedScore;
      maxPossibleScore += category.weight;
    });

    // Convert to percentage
    const overallScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Determine grade
    let grade: string;
    if (overallScore >= 90) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 80) grade = 'B+';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 70) grade = 'C+';
    else if (overallScore >= 65) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    // Generate AI recommendations (mock for now)
    const recommendations: AIRecommendation[] = [
      {
        id: '1',
        category: 'credit_profile',
        priority: 'high',
        title: 'Improve Personal Credit Score',
        description: 'Focus on improving your personal credit score to enhance fundability.',
        actionItems: [
          'Pay down existing credit card balances',
          'Ensure all payments are made on time',
          'Consider becoming an authorized user on high-limit accounts'
        ],
        estimatedImpact: 15,
        timeframe: '3-6 months'
      }
    ];

    // Identify strengths and improvements
    const strengths: string[] = [];
    const improvements: string[] = [];

    Object.entries(categoryScores).forEach(([categoryId, score]) => {
      const category = assessmentCategories.find(c => c.id === categoryId);
      if (category) {
        if (score >= category.weight * 0.8) {
          strengths.push(`Strong ${category.title.toLowerCase()}`);
        } else if (score < category.weight * 0.5) {
          improvements.push(`Improve ${category.title.toLowerCase()}`);
        }
      }
    });

    const result: AssessmentResult = {
      id: currentAssessmentId,
      overallScore,
      categoryScores,
      grade,
      percentile: Math.min(95, overallScore + Math.floor(Math.random() * 10)),
      recommendations,
      strengths,
      improvements
    };

    // Save assessment to database
    try {
      const { error } = await supabase
        .from('advanced_fundability_assessments')
        .insert({
          id: currentAssessmentId,
          user_id: user?.id,
          overall_score: overallScore,
          category_scores: categoryScores,
          completion_percentage: 100,
          recommendations: recommendations.map(r => r.title),
          improvement_areas: improvements,
          strengths,
          assessment_date: new Date().toISOString(),
          assessment_version: '3.0',
          status: 'completed',
          metadata: { grade, percentile: result.percentile }
        });

      if (error) {
        console.error('Failed to save assessment:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }

    return result;
  }, [categoryResponses, currentAssessmentId, user, assessmentCategories]);

  // Navigation functions
  const nextStep = async () => {
    if (currentStep < assessmentCategories.length - 1) {
      await saveCategoryResponses();
      setCurrentStep(currentStep + 1);
    } else {
      // Complete assessment
      setIsAnalyzing(true);
      try {
        await saveCategoryResponses();
        const result = await calculateAssessment();
        setAssessmentResult(result);
      } catch (error) {
        setError('Failed to complete assessment. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAssessment = () => {
    setCategoryResponses([]);
    setCurrentStep(0);
    setAssessmentResult(null);
    setError(null);
    setCurrentAssessmentId(crypto.randomUUID());
  };

  // Render question component
  const renderQuestion = (question: AssessmentQuestion) => {
    const response = categoryResponses.find(r => r.questionId === question.id);
    const value = response?.response;

    return (
      <div key={question.id} className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
        <label className="block text-lg font-medium text-gray-900 mb-4">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {question.type === 'boolean' && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleResponseChange(question.id, true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                value === true
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleResponseChange(question.id, false)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                value === false
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        )}

        {question.type === 'select' && question.options && (
          <select
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option...</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  // Results display component
  const ResultsDisplay: React.FC<{ result: AssessmentResult }> = ({ result }) => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
          <Award className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Assessment Complete</h2>
        <div className="text-7xl font-bold text-blue-600 mb-2">{result.overallScore}</div>
        <div className="text-2xl text-gray-600 mb-2">Grade: {result.grade}</div>
        <div className="text-lg text-gray-500">
          You scored better than {result.percentile}% of businesses
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="text-green-700">{strength}</li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" />
            Improvements
          </h3>
          <ul className="space-y-2">
            {result.improvements.map((improvement, index) => (
              <li key={index} className="text-yellow-700">{improvement}</li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            AI Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="text-blue-700 text-sm">{rec.title}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={resetAssessment}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Take New Assessment
        </button>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Download Report
        </button>
      </div>
    </div>
  );

  // Loading states
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Assessment</h2>
        <p className="text-gray-600 mb-2">Our AI is processing your responses...</p>
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
    );
  }

  // Show results if assessment is complete
  if (assessmentResult) {
    return <ResultsDisplay result={assessmentResult} />;
  }

  const currentCategory = assessmentCategories[currentStep];
  const progress = ((currentStep + 1) / assessmentCategories.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-gray-200 h-3">
        <div 
          className="bg-blue-600 h-3 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Header */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-blue-600" />
              Advanced AI Fundability Calculator
            </h1>
            <p className="text-gray-600 mt-2">
              Step {currentStep + 1} of {assessmentCategories.length}: {currentCategory.title}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto">
          {assessmentCategories.map((category, index) => (
            <div
              key={category.id}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
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

      {/* Questions */}
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{currentCategory.title}</h2>
          <p className="text-gray-600 text-lg">{currentCategory.description}</p>
        </div>

        <div className="space-y-6">
          {currentCategory.questions.map(renderQuestion)}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={!isCategoryComplete(currentStep) || isLoading}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isCategoryComplete(currentStep) && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : currentStep === assessmentCategories.length - 1 ? (
              <BarChart3 className="w-5 h-5 mr-2" />
            ) : (
              <ChevronRight className="w-5 h-5 mr-2" />
            )}
            {currentStep === assessmentCategories.length - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAIFundabilityCalculator;