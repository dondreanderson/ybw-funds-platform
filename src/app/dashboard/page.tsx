'use client'

import { useState } from 'react'
import SimpleFundabilityCalculator from '../../components/SimpleFundabilityCalculator'
import AdvancedFundabilityCalculator from '../../components/AdvancedFundabilityCalculator'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const [showSimpleCalculator, setShowSimpleCalculator] = useState(false)
  const [showAdvancedCalculator, setShowAdvancedCalculator] = useState(false)
  const [fundabilityScore, setFundabilityScore] = useState(58) // Updated to match your current score

  const handleScoreUpdate = (newScore: number) => {
    setFundabilityScore(newScore)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            YBW Funds Dashboard
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fundability Score */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">F</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Fundability Score
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {fundabilityScore}/100
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Funds */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Available Funds
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        $125,000
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Applications */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Applications
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        3
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Fundability Assessment Tools
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Choose the assessment type that best fits your needs. Get actionable insights to improve your business fundability.
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Quick Assessment clicked!')
                      setShowSimpleCalculator(true)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    ⚡ Quick Assessment (6 questions)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Advanced Assessment clicked!')
                      setShowAdvancedCalculator(true)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    🎯 Advanced Assessment (125+ criteria)
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Funding explorer coming soon!')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    🔍 Explore Funding Options
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Calculator Modal */}
      {showSimpleCalculator && (
        <SimpleFundabilityCalculator 
          onClose={() => setShowSimpleCalculator(false)}
          onScoreUpdate={handleScoreUpdate}
        />
      )}

      {/* Advanced Calculator Modal */}
      {showAdvancedCalculator && (
        <AdvancedFundabilityCalculator 
          onClose={() => setShowAdvancedCalculator(false)}
          onScoreUpdate={handleScoreUpdate}
        />
      )}
    </div>
  )
}
