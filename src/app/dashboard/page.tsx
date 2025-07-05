'use client'

import { useState } from 'react'
import { TrendingUp, DollarSign, FileText, Target, BarChart3, Users } from 'lucide-react'
import SimpleFundabilityCalculator from '../../components/SimpleFundabilityCalculator'
import AdvancedFundabilityCalculator from '../../components/AdvancedFundabilityCalculator'
import FundabilityScoreGauge from '../../components/charts/FundabilityScoreGauge'
import CategoryRadarChart from '../../components/charts/CategoryRadarChart'
import ScoreTrendChart from '../../components/charts/ScoreTrendChart'
import MetricCard from '../../components/charts/MetricCard'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function EnhancedDashboard() {
  const [showSimpleCalculator, setShowSimpleCalculator] = useState(false)
  const [showAdvancedCalculator, setShowAdvancedCalculator] = useState(false)
  const [fundabilityScore, setFundabilityScore] = useState(85)

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

          {/* Enhanced Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Fundability Score"
              value={`${fundabilityScore}/100`}
              subtitle="Current Assessment"
              icon={Target}
              color="purple"
              trend={{ value: 12, isPositive: true }}
            />
            <MetricCard
              title="Available Funds"
              value="$125,000"
              subtitle="Estimated Capacity"
              icon={DollarSign}
              color="green"
              trend={{ value: 8, isPositive: true }}
            />
            <MetricCard
              title="Active Applications"
              value="3"
              subtitle="In Progress"
              icon={FileText}
              color="blue"
            />
            <MetricCard
              title="Improvement Areas"
              value="2"
              subtitle="Priority Actions"
              icon={TrendingUp}
              color="yellow"
            />
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Fundability Score Gauge */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Fundability Score
              </h3>
              <div className="flex justify-center">
                <FundabilityScoreGauge score={fundabilityScore} size={250} />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Breakdown
              </h3>
              <CategoryRadarChart />
            </div>
          </div>

          {/* Score Trend */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Score Progress Over Time
            </h3>
            <ScoreTrendChart />
          </div>

          {/* Assessment Tools */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Fundability Assessment Tools
                </h3>
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Choose the assessment type that best fits your needs. Get actionable insights to improve your business fundability.
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowSimpleCalculator(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ⚡ Quick Assessment
                  <span className="ml-2 text-sm opacity-90">(6 questions)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvancedCalculator(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  🎯 Advanced Assessment
                  <span className="ml-2 text-sm opacity-90">(125+ criteria)</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Funding explorer coming soon!')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  🔍 Explore Funding Options
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Advanced Assessment Completed
                      </p>
                      <p className="text-sm text-gray-500">Score improved by 12 points</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Business Credit Report Updated
                      </p>
                      <p className="text-sm text-gray-500">New tradeline added</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Coaching Session Scheduled
                      </p>
                      <p className="text-sm text-gray-500">Business credit optimization</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Modals */}
      {showSimpleCalculator && (
        <SimpleFundabilityCalculator 
          onClose={() => setShowSimpleCalculator(false)}
          onScoreUpdate={handleScoreUpdate}
        />
      )}

      {showAdvancedCalculator && (
        <AdvancedFundabilityCalculator 
          onClose={() => setShowAdvancedCalculator(false)}
          onScoreUpdate={handleScoreUpdate}
        />
      )}
    </div>
  )
}
