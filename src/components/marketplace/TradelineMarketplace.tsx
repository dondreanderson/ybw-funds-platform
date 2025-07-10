'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  StarIcon,
  ClockIcon,
  CreditCardIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface Tradeline {
  id: string
  tradeline_type: string
  account_type: string
  creditor_name: string
  credit_limit: number
  current_balance: number
  utilization_percentage: number
  account_age_years: number
  payment_history_months: number
  reports_to_bureaus: string[]
  available_spots: number
  spot_duration_months: number
  spot_price: number
  setup_fee: number
  min_credit_score: number
  perfect_payment_history: boolean
  tradeline_providers: {
    company_name: string
    rating: number
    success_rate: number
  }
}

export default function TradelineMarketplace() {
  const [tradelines, setTradelines] = useState<Tradeline[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    tradeline_type: '',
    max_price: '',
    min_credit_limit: ''
  })

  useEffect(() => {
    loadTradelines()
  }, [filters])

  const loadTradelines = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/marketplace/tradelines?${params}`)
      const data = await response.json()

      if (data.success) {
        setTradelines(data.data)
      }
    } catch (error) {
      console.error('Error loading tradelines:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTradelineTypeColor = (type: string) => {
    const colors = {
      'authorized_user': 'bg-blue-100 text-blue-800',
      'business_account': 'bg-green-100 text-green-800',
      'supplier_account': 'bg-purple-100 text-purple-800',
      'utility_account': 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 10) return 'text-green-600'
    if (utilization <= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Tradeline Marketplace</h1>
          <p className="text-gray-600 mt-2">
            Build business credit with authorized user tradelines
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Tradelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tradeline Type
              </label>
              <select
                value={filters.tradeline_type}
                onChange={(e) => setFilters({ ...filters, tradeline_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="authorized_user">Authorized User</option>
                <option value="business_account">Business Account</option>
                <option value="supplier_account">Supplier Account</option>
                <option value="utility_account">Utility Account</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                placeholder="$1,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Credit Limit
              </label>
              <input
                type="number"
                value={filters.min_credit_limit}
                onChange={(e) => setFilters({ ...filters, min_credit_limit: e.target.value })}
                placeholder="$10,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tradelines Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tradelines.map((tradeline, index) => (
            <motion.div
              key={tradeline.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{tradeline.creditor_name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTradelineTypeColor(tradeline.tradeline_type)}`}>
                    {tradeline.tradeline_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <CreditCardIcon className="w-8 h-8 text-blue-500" />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Credit Limit</p>
                  <p className="text-lg font-semibold">{formatCurrency(tradeline.credit_limit)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Age</p>
                  <p className="text-lg font-semibold">{tradeline.account_age_years} years</p>
                </div>
              </div>

              {/* Utilization */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Utilization</span>
                  <span className={`text-sm font-medium ${getUtilizationColor(tradeline.utilization_percentage)}`}>
                    {tradeline.utilization_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      tradeline.utilization_percentage <= 10 ? 'bg-green-500' :
                      tradeline.utilization_percentage <= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(tradeline.utilization_percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Payment History */}
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  {tradeline.payment_history_months} months perfect payment history
                </span>
              </div>

              {/* Credit Bureaus */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Reports to</p>
                <div className="flex flex-wrap gap-1">
                  {tradeline.reports_to_bureaus.map(bureau => (
                    <span
                      key={bureau}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {bureau.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Provider Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tradeline.tradeline_providers.company_name}</span>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs">{tradeline.tradeline_providers.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {tradeline.tradeline_providers.success_rate}% success rate
                </p>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available spots</span>
                  <span className="text-sm font-medium">{tradeline.available_spots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium">{tradeline.spot_duration_months} months</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Total Cost</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(tradeline.spot_price + tradeline.setup_fee)}
                  </span>
                </div>
                {tradeline.setup_fee > 0 && (
                  <p className="text-xs text-gray-500">
                    Includes {formatCurrency(tradeline.setup_fee)} setup fee
                  </p>
                )}
              </div>

              {/* Requirements */}
              {tradeline.min_credit_score > 0 && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    Minimum credit score: {tradeline.min_credit_score}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={tradeline.available_spots === 0}
              >
                {tradeline.available_spots > 0 ? 'Purchase Spot' : 'Sold Out'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {tradelines.length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tradelines found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more options.</p>
          </div>
        )}
      </div>
    </div>
  )
}