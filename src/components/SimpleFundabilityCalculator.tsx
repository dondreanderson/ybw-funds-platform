'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuickRegistration } from '@/components/auth/QuickRegistration'

interface CalculatorProps {
  onClose?: () => void
  onScoreUpdate?: (score: number) => void
  isTrialMode?: boolean
}

interface SimpleAnswers {
  hasEIN: boolean | null
  businessStructure: string
  hasBusinessBank: boolean | null
  hasBusinessPhone: boolean | null
  hasWebsite: boolean | null
  hasBusinessAddress: boolean | null
  businessAge: number
  hasBusinessCredit: boolean | null
  hasRevenue: boolean | null
  annualRevenue: number
  hasInsurance: boolean | null
  hasDUNS: boolean | null
}

export default function SimpleFundabilityCalculator({ 
  onClose, 
  onScoreUpdate, 
  isTrialMode = false 
}: CalculatorProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<SimpleAnswers>({
    hasEIN: null,
    businessStructure: '',
    hasBusinessBank: null,
    hasBusinessPhone: null,
    hasWebsite: null,
    hasBusinessAddress: null,
    businessAge: 0,
    hasBusinessCredit: null,
    hasRevenue: null,
    annualRevenue: 0,
    hasInsurance: null,
    hasDUNS: null
  })
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false) // ✅ Added registration state
  const [isCalculating, setIsCalculating] = useState(false)

  const questions = [
    {
      id: 'hasEIN',
      question: 'Do you have an EIN (Employer Identification Number)?',
      type: 'boolean',
      category: 'Business Foundation',
      helpText: 'An EIN is essential for business banking and credit building.'
    },
    {
      id: 'businessStructure',
      question: 'What is your business legal structure?',
      type: 'select',
      options: ['', 'Sole Proprietorship', 'Partnership', 'LLC', 'Corporation'],
      category: 'Business Foundation',
      helpText: 'Your business structure affects liability and funding opportunities.'
    },
    {
      id: 'hasBusinessBank',
      question: 'Do you have a dedicated business bank account?',
      type: 'boolean',
      category: 'Banking & Finance',
      helpText: 'Separate business banking is crucial for credit building.'
    },
    {
      id: 'businessAge',
      question: 'How many months has your business been operating?',
      type: 'number',
      category: 'Business Foundation',
      helpText: 'Longer operating history improves funding opportunities.'
    },
    {
      id: 'annualRevenue',
      question: 'What is your approximate annual revenue?',
      type: 'revenue',
      category: 'Banking & Finance',
      helpText: 'Higher revenue demonstrates business viability.'
    },
    {
      id: 'hasBusinessCredit',
      question: 'Have you established business credit?',
      type: 'boolean',
      category: 'Business Credit Profile',
      helpText: 'Business credit is separate from personal credit.'
    },
    {
      id: 'hasDUNS',
      question: 'Do you have a DUNS number from Dun & Bradstreet?',
      type: 'boolean',
      category: 'Business Credit Profile',
      helpText: 'DUNS numbers are essential for business credit building.'
    },
    {
      id: 'hasWebsite',
      question: 'Do you have a professional business website?',
      type: 'boolean',
      category: 'Marketing Presence',
      helpText: 'A professional website builds credibility with lenders.'
    },
    {
      id: 'hasBusinessPhone',
      question: 'Do you have a dedicated business phone number?',
      type: 'boolean',
      category: 'Marketing Presence',
      helpText: 'A dedicated business phone adds professionalism.'
    },
    {
      id: 'hasInsurance',
      question: 'Do you have business insurance coverage?',
      type: 'boolean',
      category: 'Documentation',
      helpText: 'Insurance demonstrates risk management to lenders.'
    }
  ]

  const currentQuestion = questions[currentStep]

  const calculateScore = () => {
    setIsCalculating(true)
    
    try {
      let totalScore = 0
      
      // Business Foundation (40 points)
      if (answers.hasEIN) totalScore += 8
      if (answers.businessStructure === 'Corporation') totalScore += 10
      else if (answers.businessStructure === 'LLC') totalScore += 8
      else if (answers.businessStructure === 'Partnership') totalScore += 5
      else if (answers.businessStructure === 'Sole Proprietorship') totalScore += 3
      
      if (answers.businessAge >= 36) totalScore += 12
      else if (answers.businessAge >= 24) totalScore += 10
      else if (answers.businessAge >= 12) totalScore += 7
      else if (answers.businessAge >= 6) totalScore += 4
      
      // Banking & Finance (25 points)
      if (answers.hasBusinessBank) totalScore += 10
      if (answers.hasRevenue) totalScore += 5
      
      // Revenue scoring
      if (answers.annualRevenue >= 1000000) totalScore += 10
      else if (answers.annualRevenue >= 500000) totalScore += 8
      else if (answers.annualRevenue >= 250000) totalScore += 6
      else if (answers.annualRevenue >= 100000) totalScore += 4
      else if (answers.annualRevenue >= 50000) totalScore += 2
      
      // Business Credit (20 points)
      if (answers.hasBusinessCredit) totalScore += 10
      if (answers.hasDUNS) totalScore += 10
      
      // Marketing Presence (10 points)
      if (answers.hasWebsite) totalScore += 5
      if (answers.hasBusinessPhone) totalScore += 5
      
      // Documentation (5 points)
      if (answers.hasInsurance) totalScore += 5
      
      const finalScore = Math.min(totalScore, 100)
      
      setScore(finalScore)
      setShowResults(true)
      if (onScoreUpdate) onScoreUpdate(finalScore)
    } catch (error) {
      console.error('Error calculating score:', error)
      alert('Error calculating score. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const getRecommendations = () => {
    const recommendations = []
    
    if (!answers.hasEIN) recommendations.push("Obtain an EIN (Employer Identification Number)")
    if (!answers.businessStructure || answers.businessStructure === 'Sole Proprietorship') {
      recommendations.push("Consider forming an LLC or Corporation for better fundability")
    }
    if (!answers.hasBusinessBank) recommendations.push("Open a dedicated business bank account")
    if (!answers.hasBusinessPhone) recommendations.push("Set up a business phone line")
    if (!answers.hasWebsite) recommendations.push("Create a professional business website")
    if (!answers.hasBusinessCredit) recommendations.push("Start building business credit")
    if (!answers.hasDUNS) recommendations.push("Apply for a DUNS number from Dun & Bradstreet")
    if (!answers.hasInsurance) recommendations.push("Obtain business insurance")
    if (answers.businessAge < 12) recommendations.push("Build business operating history")
    if (answers.annualRevenue < 100000) recommendations.push("Focus on increasing annual revenue")
    
    return recommendations
  }

  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'text-green-600' }
    if (score >= 65) return { grade: 'B', label: 'Good', color: 'text-blue-600' }
    if (score >= 50) return { grade: 'C', label: 'Fair', color: 'text-yellow-600' }
    if (score >= 35) return { grade: 'D', label: 'Poor', color: 'text-orange-600' }
    return { grade: 'F', label: 'Very Poor', color: 'text-red-600' }
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      calculateScore()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const isAnswered = (): boolean => {
    const answer = answers[currentQuestion.id as keyof SimpleAnswers]
    if (currentQuestion.type === 'boolean') return answer !== null
    if (currentQuestion.type === 'select') return answer !== '' && answer !== null
    if (currentQuestion.type === 'number' || currentQuestion.type === 'revenue') {
      return answer !== null && typeof answer === 'number' && answer >= 0
    }
    return true
  }

  // ✅ Handler for creating account with calculator results
  const handleCreateAccount = () => {
    const calculatorResults = {
      score,
      answers,
      recommendations: getRecommendations(),
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('pendingCalculatorResults', JSON.stringify(calculatorResults));
    setShowRegistration(true);
  };

  if (showResults) {
    const gradeInfo = getGrade(score)
    const recommendations = getRecommendations()

    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold mb-2">
                {isTrialMode ? '🆓 Your Free Fundability Score' : '📊 Your Fundability Score'}
              </h2>
              <p className="text-blue-100">
                {isTrialMode ? 'Get the full assessment for detailed insights!' : 'Your business funding readiness analysis'}
              </p>
            </div>

            <div className="p-6">
              {/* Score Display */}
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={score >= 65 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${score * 2.51} 251`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">{score}</span>
                    <span className="text-sm text-gray-600">out of 100</span>
                  </div>
                </div>
                
                <h3 className={`text-2xl font-bold ${gradeInfo.color} mb-2`}>
                  Grade {gradeInfo.grade} - {gradeInfo.label}
                </h3>
                <p className="text-gray-600">Your Fundability Score</p>
              </div>

              {/* Recommendations */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">
                  🎯 Top Recommendations {isTrialMode ? '(Preview)' : ''}
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    {recommendations.slice(0, isTrialMode ? 3 : recommendations.length).map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-blue-800">{rec}</span>
                      </li>
                    ))}
                    {isTrialMode && recommendations.length > 3 && (
                      <li className="text-blue-600 font-medium">
                        + {recommendations.length - 3} more recommendations in full assessment
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isTrialMode ? (
                  <>
                    <button
                      onClick={() => router.push('/assessment')}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      🚀 Get Full Assessment (125+ Criteria)
                    </button>
                    {/* ✅ Updated signup button with registration handler */}
                    <button
                      onClick={handleCreateAccount}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      📊 Create Free Account
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        localStorage.setItem('simpleAssessmentResults', JSON.stringify({
                          score,
                          answers,
                          recommendations: getRecommendations(),
                          completedAt: new Date().toISOString()
                        }))
                        if (onClose) onClose()
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save & Continue
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      📄 Print Results
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Registration Modal */}
        {showRegistration && (
          <QuickRegistration
            calculatorResults={JSON.parse(localStorage.getItem('pendingCalculatorResults') || 'null')}
            onClose={() => setShowRegistration(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {isTrialMode ? '🆓 Free Fundability Calculator' : '📊 Quick Assessment'}
              </h2>
              <p className="text-blue-100 mt-1">
                {isTrialMode ? 'Get your free business fundability score in 2 minutes' : 'Quick fundability assessment'}
              </p>
            </div>
            {onClose && (
              <button 
                onClick={onClose} 
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <div className="text-sm text-blue-600 font-medium mb-2">
              {currentQuestion.category}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {currentQuestion.question}
            </h3>
            {currentQuestion.helpText && (
              <p className="text-gray-600 text-sm mb-4">
                💡 {currentQuestion.helpText}
              </p>
            )}
          </div>

          {/* Answer Options */}
          <div className="mb-6">
            {currentQuestion.type === 'boolean' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateAnswer(true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id as keyof SimpleAnswers] === true
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  onClick={() => updateAnswer(false)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id as keyof SimpleAnswers] === false
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  ❌ No
                </button>
              </div>
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <select
                value={answers[currentQuestion.id as keyof SimpleAnswers] as string}
                onChange={(e) => updateAnswer(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {currentQuestion.options.map((option) => (
                  <option key={option} value={option}>
                    {option || 'Select an option...'}
                  </option>
                ))}
              </select>
            )}

            {currentQuestion.type === 'number' && (
              <input
                type="number"
                value={answers[currentQuestion.id as keyof SimpleAnswers] as number}
                onChange={(e) => updateAnswer(parseInt(e.target.value) || 0)}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter number of months..."
                min="0"
              />
            )}

            {currentQuestion.type === 'revenue' && (
              <div>
                <input
                  type="number"
                  value={answers[currentQuestion.id as keyof SimpleAnswers] as number}
                  onChange={(e) => updateAnswer(parseInt(e.target.value) || 0)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter annual revenue..."
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💰 Enter your approximate annual revenue in dollars
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswered() || isCalculating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? 'Calculating...' : 
               currentStep === questions.length - 1 ? 'Calculate Score 🎯' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
