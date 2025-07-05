import { User, AssessmentData, APIResponse } from "@/types/common";
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, CheckCircle, ArrowRight, X } from 'lucide-react';
import { aiScoringEngine, type AssessmentData } from '@/lib/ai-scoring-engine';
import { realAssessmentService } from '@/lib/services/realAssessmentService';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedSimpleCalculatorProps {
  onClose: () => void;
  onScoreUpdate: (score: number) => void;
}

export default function EnhancedSimpleCalculator({ 
  onClose, 
  onScoreUpdate 
}: EnhancedSimpleCalculatorProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);

  const questions = [
    {
      id: 'business_structure',
      question: 'What is your business structure?',
      type: 'select' as const,
      options: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship'],
      required: true,
      criteriaIds: ['ls-001']
    },
    {
      id: 'ein_status',
      question: 'Do you have an EIN (Federal Tax ID)?',
      type: 'boolean' as const,
      required: true,
      criteriaIds: ['bf-001']
    },
    {
      id: 'business_bank_account',
      question: 'Do you have a dedicated business bank account?',
      type: 'boolean' as const,
      required: true,
      criteriaIds: ['bf-101']
    },
    {
      id: 'business_website',
      question: 'Do you have a professional business website?',
      type: 'boolean' as const,
      required: true,
      criteriaIds: ['mp-001']
    },
    {
      id: 'years_in_business',
      question: 'How many years has your business been operating?',
      type: 'number' as const,
      required: true,
      criteriaIds: ['bf-005']
    },
    {
      id: 'annual_revenue',
      question: 'What is your approximate annual revenue?',
      type: 'select' as const,
      options: [
        'Less than $50,000',
        '$50,000 - $100,000',
        '$100,000 - $250,000',
        '$250,000 - $500,000',
        '$500,000 - $1,000,000',
        'More than $1,000,000'
      ],
      required: true,
      criteriaIds: ['fh-001']
    }
  ];

  const handleAnswer = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [questions[currentStep].id]: value
    }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Convert responses to assessment data
      const completedCriteria: string[] = [];
      
      // Map responses to completed criteria
      questions.forEach(question => {
        const response = responses[question.id];
        if (question.type === 'boolean' && response === true) {
          completedCriteria.push(...question.criteriaIds);
        } else if (question.type === 'select' && response) {
          if (question.id === 'business_structure' && response !== 'Sole Proprietorship') {
            completedCriteria.push(...question.criteriaIds);
          }
        } else if (question.type === 'number' && response >= 2) {
          completedCriteria.push(...question.criteriaIds);
        }
      });

      // Convert revenue response to number
      const revenueMap: Record<string, number> = {
        'Less than $50,000': 25000,
        '$50,000 - $100,000': 75000,
        '$100,000 - $250,000': 175000,
        '$250,000 - $500,000': 375000,
        '$500,000 - $1,000,000': 750000,
        'More than $1,000,000': 1500000
      };

      const assessmentData: AssessmentData = {
        userId: user?.id ?? "",
        businessType: responses.years_in_business >= 2 ? 'established' : 'startup',
        industry: 'general', // Could be enhanced with industry question
        yearsInBusiness: responses.years_in_business || 0,
        annualRevenue: revenueMap[responses.annual_revenue] || 0,
        completedCriteria,
        responses
      };

      // Calculate AI-driven score
      const scoringResult = await aiScoringEngine.calculateFundabilityScore(assessmentData);

      // Save to database
      await saveAssessmentToDatabase(assessmentData, scoringResult);

      setResult(scoringResult);
      onScoreUpdate(scoringResult.percentage);
    } catch (error) {
      console.error('Error calculating results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAssessmentToDatabase = async (assessmentData: AssessmentData, result: any) => {
    try {
      // Convert to format compatible with existing database
      const categoryPerformances = result.categoryScores.map((cat: any, index: number) => ({
        categoryId: `cat_${index + 1}`,
        categoryName: cat.category,
        score: Math.round((cat.percentage / 100) * 100), // Convert to 0-100 scale
        maxScore: 100,
        completedCriteria: cat.completedCriteria,
        totalCriteria: cat.totalCriteria,
        answers: assessmentData.responses
      }));

      await realAssessmentService.saveAssessment(
        user!.id,
        Math.round(result.percentage),
        result.categoryScores.reduce((acc: any, cat: any) => {
          acc[cat.category.toLowerCase().replace(/\s+/g, '_')] = Math.round(cat.percentage);
          return acc;
        }, {}),
        categoryPerformances
      );
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const currentQuestion = questions[currentStep];
  const isAnswered = responses[currentQuestion?.id] !== undefined;

  if (result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Assessment Results</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* Score Display */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white mb-4">
              <span className="text-3xl font-bold">{Math.round(result.percentage)}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fundability Score: {result.fundabilityGrade}
            </h3>
            <p className="text-gray-600">
              Your business fundability score is {Math.round(result.percentage)} out of 100
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h4>
            <div className="space-y-3">
              {result.categoryScores.slice(0, 6).map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12">
                      {Math.round(category.percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recommendations */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Recommendations</h4>
            <div className="space-y-3">
              {result.recommendations.slice(0, 3).map((rec: any, index: number) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{rec.title}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <div className="text-xs text-gray-500">
                    Impact: +{rec.estimatedImpact} points • Time: {rec.timeToComplete}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Enhanced Dashboard
            </button>
            <button
              onClick={() => {
                // Could integrate with advanced calculator
                onClose();
              }}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Take Advanced Assessment
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculating Your Score</h3>
            <p className="text-gray-600">Our AI is analyzing your responses...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calculator className="mr-3 text-blue-600" size={28} />
                Quick Fundability Assessment
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentStep + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Question */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.question}
              </h3>

              {currentQuestion.type === 'boolean' && (
                <div className="space-y-3">
                  {[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' }
                  ].map((option) => (
                    <button
                      key={option.value.toString()}
                      onClick={() => handleAnswer(option.value)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        responses[currentQuestion.id] === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 ${
                            responses[currentQuestion.id] === option.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {responses[currentQuestion.id] === option.value && (
                            <CheckCircle size={20} className="text-white -m-0.5" />
                          )}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'select' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        responses[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 ${
                            responses[currentQuestion.id] === option
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {responses[currentQuestion.id] === option && (
                            <CheckCircle size={20} className="text-white -m-0.5" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'number' && (
                <div>
                  <input
                    type="number"
                    value={responses[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(parseInt(e.target.value) || 0)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                    placeholder="Enter number of years"
                    min="0"
                    max="50"
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  isAnswered
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentStep === questions.length - 1 ? (
                  <span className="flex items-center justify-center">
                    Calculate Score
                    <TrendingUp className="ml-2" size={20} />
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Next
                    <ArrowRight className="ml-2" size={20} />
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
