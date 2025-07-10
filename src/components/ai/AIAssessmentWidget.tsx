'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { AIAssessmentResult } from '@/lib/types/database'

interface AIAssessmentWidgetProps {
  onComplete?: (result: AIAssessmentResult) => void
}

export default function AIAssessmentWidget({ onComplete }: AIAssessmentWidgetProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [assessmentData] = useState({
    businessStructure: {
      hasEIN: true,
      businessType: 'LLC',
      stateOfIncorporation: 'California',
      yearsInBusiness: 3,
      hasBusinessLicense: true,
      hasDBA: false
    },
    financials: {
      annualRevenue: 250000,
      monthlyRevenue: 20000,
      cashFlow: 5000,
      hasBusinessBankAccount: true,
      separateBusinessCredit: true,
      personalCreditScore: 720,
      businessCreditScore: 80
    },
    digitalPresence: {
      hasBusinessAddress: true,
      hasDedicatedBusinessPhone: true,
      hasBusinessEmail: true,
      hasBusinessWebsite: true,
      has411Listing: false,
      googleMyBusinessOptimized: true,
      socialMediaPresence: 3
    },
    banking: {
      businessBankAccountAge: 36,
      numberOfBankAccounts: 2,
      hasBusinessCreditCards: true,
      averageAccountBalance: 25000,
      overdraftHistory: 0
    },
    industry: {
      industryType: 'Technology',
      riskLevel: 'low' as const,
      seasonality: false,
      regulatoryCompliance: true
    }
  })

  const [result, setResult] = useState<AIAssessmentResult | null>(null)

  const runAIAssessment = async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/ai/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessmentData)
      })

      const data = await response.json()
      
      if (data.success) {
        const assessmentResult = data.data as AIAssessmentResult
        setResult(assessmentResult)
        onComplete?.(assessmentResult)
      } else {
        console.error('Assessment failed:', data.error)
      }
    } catch (error) {
      console.error('Assessment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <h3 className="text-lg font-semibold mb-2">AI Assessment in Progress</h3>
        <p className="text-gray-600 text-center">
          Our AI is analyzing your business data and generating personalized recommendations...
        </p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">AI Assessment Results</h2>
        
        {/* Overall Score */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Overall Fundability Score</span>
            <span className="text-3xl font-bold text-blue-600">{result.overallScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.overallScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-blue-600 h-3 rounded-full"
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className="mb-6">
          <span className="text-sm font-medium text-gray-600">Risk Level: </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            result.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
            result.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {result.riskLevel.toUpperCase()}
          </span>
        </div>

        {/* Funding Potential */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Funding Potential</h3>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            Up to ${result.fundingPotential.maxAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Estimated time to funding: {result.fundingPotential.timeToFunding} days
          </p>
          <div className="flex flex-wrap gap-2">
            {result.fundingPotential.recommendedProducts.map((product: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {product}
              </span>
            ))}
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Top Recommendations</h3>
          {result.recommendations.slice(0, 3).map((rec, index: number) => (
            <div key={rec.id} className="mb-4 p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                <span className={`px-2 py-1 text-xs rounded ${
                  rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Impact: +{rec.impact} points</span>
                <span>Effort: {rec.effort}</span>
                <span>Timeline: {rec.timeframe}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2">
            {result.nextSteps.map((step: string, index: number) => (
              <li key={index} className="text-gray-700">{step}</li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => setResult(null)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run New Assessment
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">AI-Powered Fundability Assessment</h2>
      
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-4">Ready for AI Assessment?</h3>
        <p className="text-gray-600 mb-6">
          Our advanced AI will analyze your business and provide personalized recommendations.
        </p>
        
        <button
          onClick={runAIAssessment}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          🤖 Start AI Assessment
        </button>
      </div>
    </div>
  )
}
