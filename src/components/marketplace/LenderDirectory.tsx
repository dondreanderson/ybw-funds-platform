'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface Lender {
  id: string
  company_name: string
  lender_type: string
  rating: number
  review_count: number
  min_loan_amount: number
  max_loan_amount: number
  min_interest_rate: number
  max_interest_rate: number
  funding_speed_days: number
  states_licensed: string[]
  description: string
  logo_url?: string
  loan_products: any[]
}

export default function LenderDirectory() {
  const [lenders, setLenders] = useState<Lender[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    lender_type: '',
    min_amount: '',
    max_amount: '',
    state: ''
  })

  useEffect(() => {
    loadLenders()
  }, [filters])

  const loadLenders = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/marketplace/lenders?${params}`)
      const data = await response.json()

      if (data.success) {
        setLenders(data.data)
      }
    } catch (error) {
      console.error('Error loading lenders:', error)
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

  const getLenderTypeColor = (type: string) => {
    const colors = {
      'traditional_bank': 'bg-blue-100 text-blue-800',
      'credit_union': 'bg-green-100 text-green-800',
      'online_lender': 'bg-purple-100 text-purple-800',
      'alternative_lender': 'bg-orange-100 text-orange-800',
      'sba_preferred': 'bg-red-100 text-red-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Lender Directory</h1>
          <p className="text-gray-600 mt-2">
            Find the right lender for your business needs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Lenders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lender Type
              </label>
              <select
                value={filters.lender_type}
                onChange={(e) => setFilters({ ...filters, lender_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="traditional_bank">Traditional Bank</option>
                <option value="credit_union">Credit Union</option>
                <option value="online_lender">Online Lender</option>
                <option value="alternative_lender">Alternative Lender</option>
                <option value="sba_preferred">SBA Preferred</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                value={filters.min_amount}
                onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })}
                placeholder="$10,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                value={filters.max_amount}
                onChange={(e) => setFilters({ ...filters, max_amount: e.target.value })}
                placeholder="$500,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value.toUpperCase() })}
                placeholder="CA"
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lenders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lenders.map((lender, index) => (
            <motion.div
              key={lender.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {lender.logo_url ? (
                    <img
                      src={lender.logo_url}
                      alt={lender.company_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{lender.company_name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLenderTypeColor(lender.lender_type)}`}>
                      {lender.lender_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{lender.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({lender.review_count})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {lender.description}
              </p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Loan Range</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(lender.min_loan_amount)} - {formatCurrency(lender.max_loan_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Funding Speed</p>
                    <p className="text-sm font-medium">{lender.funding_speed_days} days</p>
                  </div>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="mb-4">
                <p className="text-xs text-gray-500">Interest Rate Range</p>
                <p className="text-lg font-semibold text-blue-600">
                  {lender.min_interest_rate}% - {lender.max_interest_rate}%
                </p>
              </div>

              {/* Loan Products */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Available Products</p>
                <div className="flex flex-wrap gap-2">
                  {lender.loan_products.slice(0, 3).map((product: any) => (
                    <span
                      key={product.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {product.product_name}
                    </span>
                  ))}
                  {lender.loan_products.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{lender.loan_products.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* States */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">Licensed in {lender.states_licensed.length} states</p>
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {lender.states_licensed.slice(0, 5).join(', ')}
                    {lender.states_licensed.length > 5 && ` +${lender.states_licensed.length - 5} more`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                  Apply Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {lenders.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No lenders found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  )
};