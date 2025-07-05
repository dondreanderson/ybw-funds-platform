'use client'

import { useState } from 'react'

interface CalculatorProps {
  onClose: () => void
  onScoreUpdate: (score: number) => void
}

export default function SimpleFundabilityCalculator({ onClose, onScoreUpdate }: CalculatorProps) {
  const [answers, setAnswers] = useState({
    hasEIN: false,
    hasBusinessBank: false,
    hasBusinessPhone: false,
    hasWebsite: false,
    hasBusinessAddress: false,
    businessAge: 0,
    hasBusinessCredit: false,
    hasRevenue: false,
    hasEmployees: false,
    hasInsurance: false
  })
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [loading, setLoading] = useState<boolean>(false);

  const calculateScore = () => {
    setIsCalculating(true)
    
    try {
      let totalScore = 0
      
      // Basic Business Setup (40 points)
      if (answers.hasEIN) totalScore += 8
      if (answers.hasBusinessBank) totalScore += 8
      if (answers.hasBusinessPhone) totalScore += 6
      if (answers.hasWebsite) totalScore += 6
      if (answers.hasBusinessAddress) totalScore += 6
      if (answers.hasInsurance) totalScore += 6
      
      // Business Maturity (30 points)
      if (answers.businessAge >= 24) totalScore += 15
      else if (answers.businessAge >= 12) totalScore += 10
      else if (answers.businessAge >= 6) totalScore += 5
      
      if (answers.hasRevenue) totalScore += 10
      if (answers.hasEmployees) totalScore += 5
      
      // Credit Profile (30 points)
      if (answers.hasBusinessCredit) totalScore += 30
      else totalScore += 10 // Starting credit profile
      
      const finalScore = Math.min(totalScore, 100) // Cap at 100
      
      setScore(finalScore)
      setShowResults(true)
      onScoreUpdate(finalScore)
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
    if (!answers.hasBusinessBank) recommendations.push("Open a dedicated business bank account")
    if (!answers.hasBusinessPhone) recommendations.push("Set up a business phone line")
    if (!answers.hasWebsite) recommendations.push("Create a professional business website")
    if (!answers.hasBusinessAddress) recommendations.push("Establish a business address")
    if (!answers.hasBusinessCredit) recommendations.push("Start building business credit")
    if (!answers.hasInsurance) recommendations.push("Obtain business insurance")
    if (answers.businessAge < 12) recommendations.push("Build business operating history")
    
    return recommendations
  }

  const saveAssessment = async () => {
    try {
      const response = await fetch('/api/fundability/save-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          answers,
          recommendations: getRecommendations(),
          assessment_type: 'simple'
        })
      })
      
      if (response.ok) {
        alert('Assessment saved successfully!')
        onClose()
      } else {
        throw new Error('Failed to save assessment')
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Error saving assessment. Please try again.')
    }
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Your Fundability Score</h2>
          
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">{score}</div>
            <div className="text-xl text-gray-600">out of 100</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recommendations to Improve:</h3>
            <ul className="space-y-2">
              {getRecommendations().map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveAssessment}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Save Assessment
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fundability Assessment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Do you have an EIN (Employer Identification Number)?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasEIN"
                  checked={answers.hasEIN === true}
                  onChange={() => setAnswers({...answers, hasEIN: true})}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasEIN"
                  checked={answers.hasEIN === false}
                  onChange={() => setAnswers({...answers, hasEIN: false})}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Do you have a dedicated business bank account?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBusinessBank"
                  checked={answers.hasBusinessBank === true}
                  onChange={() => setAnswers({...answers, hasBusinessBank: true})}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBusinessBank"
                  checked={answers.hasBusinessBank === false}
                  onChange={() => setAnswers({...answers, hasBusinessBank: false})}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Do you have a dedicated business phone number?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBusinessPhone"
                  checked={answers.hasBusinessPhone === true}
                  onChange={() => setAnswers({...answers, hasBusinessPhone: true})}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBusinessPhone"
                  checked={answers.hasBusinessPhone === false}
                  onChange={() => setAnswers({...answers, hasBusinessPhone: false})}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Do you have a business website?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasWebsite"
                  checked={answers.hasWebsite === true}
                  onChange={() => setAnswers({...answers, hasWebsite: true})}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasWebsite"
                  checked={answers.hasWebsite === false}
                  onChange={() => setAnswers({...answers, hasWebsite: false})}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              How old is your business (in months)?
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={answers.businessAge}
              onChange={(e) => setAnswers({...answers, businessAge: parseInt(e.target.value) || 0})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter months in business"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Do you have established business credit?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBusinessCredit"
                  checked={answers.hasBusinessCredit === true}
                  onChange={() => setAnswers({...answers, hasBusinessCredit: true})}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasBusinessCredit"
                  checked={answers.hasBusinessCredit === false}
                  onChange={() => setAnswers({...answers, hasBusinessCredit: false})}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={calculateScore}
            disabled={isCalculating}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCalculating ? 'Calculating...' : 'Calculate My Score'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}