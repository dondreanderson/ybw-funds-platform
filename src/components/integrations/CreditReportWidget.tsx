'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface CreditReport {
  businessName: string
  ein: string
  creditScore: number
  creditRating: string
  paymentHistory: {
    onTimePayments: number
    latePayments: number
    averageDaysLate: number
  }
  creditUtilization: number
  publicRecords: any[]
  tradeLines: any[]
  inquiries: any[]
  riskFactors: string[]
  recommendations: string[]
}

export default function CreditReportWidget() {
  const [creditReport, setCreditReport] = useState<CreditReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: '',
    ein: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  })

  const fetchCreditReport = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_credit_report',
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        setCreditReport(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch credit report')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch credit report')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-yellow-50 border-yellow-200'
    if (score >= 60) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  if (!creditReport) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-6">
          <ShieldCheckIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Business Credit Report</h3>
          <p className="text-gray-600">
            Get your comprehensive business credit report to understand your creditworthiness
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); fetchCreditReport(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EIN
              </label>
              <input
                type="text"
                value={formData.ein}
                onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                placeholder="XX-XXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Address
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              placeholder="Street Address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
              required
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
                placeholder="City"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, state: e.target.value }
                })}
                placeholder="State"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, zipCode: e.target.value }
                })}
                placeholder="ZIP Code"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Fetching Credit Report...
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-5 h-5" />
                Get Credit Report
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What's included:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Business credit score and rating</li>
            <li>• Payment history analysis</li>
            <li>• Credit utilization breakdown</li>
            <li>• Public records and trade lines</li>
            <li>• Personalized recommendations</li>
          </ul>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Business Credit Report</h3>
          <p className="text-gray-600">{creditReport.businessName}</p>
        </div>
        <button
          onClick={() => setCreditReport(null)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          New Report
        </button>
      </div>

      {/* Credit Score */}
      <div className={`rounded-lg border-2 p-6 mb-6 ${getScoreBackground(creditReport.creditScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Credit Score</h4>
            <p className="text-gray-600">Business creditworthiness rating</p>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getScoreColor(creditReport.creditScore)}`}>
              {creditReport.creditScore}
            </p>
            <p className={`text-lg font-medium ${getScoreColor(creditReport.creditScore)}`}>
              {creditReport.creditRating}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Credit Utilization</p>
              <p className="text-xl font-bold">{creditReport.creditUtilization}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Payments</p>
              <p className="text-xl font-bold">{creditReport.paymentHistory.onTimePayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Late Payments</p>
              <p className="text-xl font-bold">{creditReport.paymentHistory.latePayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {creditReport.riskFactors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Risk Factors</h4>
          <div className="space-y-2">
            {creditReport.riskFactors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-800">{factor}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {creditReport.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Improvement Recommendations</h4>
          <div className="space-y-2">
            {creditReport.recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-800">{recommendation}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trade Lines & Public Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-3">Trade Lines</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">{creditReport.tradeLines.length}</p>
            <p className="text-gray-600">Active trade relationships</p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3">Public Records</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">{creditReport.publicRecords.length}</p>
            <p className="text-gray-600">Liens, judgments, bankruptcies</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-xs text-gray-500">
          Report generated on {new Date().toLocaleDateString()} • Powered by Experian
        </p>
      </div>
    </motion.div>
  )
}