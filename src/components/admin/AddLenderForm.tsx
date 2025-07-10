'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface LenderFormData {
  company_name: string
  contact_name: string
  email: string
  phone: string
  website: string
  lender_type: string
  address: {
    street: string
    city: string
    state: string
    zip_code: string
  }
  min_credit_score: number
  max_credit_score: number
  min_loan_amount: number
  max_loan_amount: number
  min_interest_rate: number
  max_interest_rate: number
  states_licensed: string[]
  description: string
}

export default function AddLenderForm({ onSubmit }: { onSubmit?: () => void }) {
  const [formData, setFormData] = useState<LenderFormData>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    lender_type: 'online_lender',
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: ''
    },
    min_credit_score: 500,
    max_credit_score: 850,
    min_loan_amount: 5000,
    max_loan_amount: 500000,
    min_interest_rate: 5.0,
    max_interest_rate: 35.0,
    states_licensed: [],
    description: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lenderTypes = [
    { value: 'traditional_bank', label: 'Traditional Bank' },
    { value: 'credit_union', label: 'Credit Union' },
    { value: 'online_lender', label: 'Online Lender' },
    { value: 'alternative_lender', label: 'Alternative Lender' },
    { value: 'sba_preferred', label: 'SBA Preferred Lender' }
  ]

  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/marketplace/lenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Lender added successfully!')
        onSubmit?.()
        // Reset form
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          website: '',
          lender_type: 'online_lender',
          address: { street: '', city: '', state: '', zip_code: '' },
          min_credit_score: 500,
          max_credit_score: 850,
          min_loan_amount: 5000,
          max_loan_amount: 500000,
          min_interest_rate: 5.0,
          max_interest_rate: 35.0,
          states_licensed: [],
          description: ''
        })
      } else {
        setError(data.error || 'Failed to add lender')
      }
    } catch (error) {
      setError('Failed to add lender')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStateToggle = (state: string) => {
    setFormData(prev => ({
      ...prev,
      states_licensed: prev.states_licensed.includes(state)
        ? prev.states_licensed.filter(s => s !== state)
        : [...prev.states_licensed, state]
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold mb-6">Add New Lender</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lender Type *
            </label>
            <select
              value={formData.lender_type}
              onChange={(e) => setFormData({ ...formData, lender_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {lenderTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.address.zip_code}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zip_code: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lending Criteria */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Lending Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Credit Score
              </label>
              <input
                type="number"
                value={formData.min_credit_score}
                onChange={(e) => setFormData({ ...formData, min_credit_score: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="300"
                max="850"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Credit Score
              </label>
              <input
                type="number"
                value={formData.max_credit_score}
                onChange={(e) => setFormData({ ...formData, max_credit_score: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="300"
                max="850"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Loan Amount ($)
              </label>
              <input
                type="number"
                value={formData.min_loan_amount}
                onChange={(e) => setFormData({ ...formData, min_loan_amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Loan Amount ($)
              </label>
              <input
                type="number"
                value={formData.max_loan_amount}
                onChange={(e) => setFormData({ ...formData, max_loan_amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.min_interest_rate}
                onChange={(e) => setFormData({ ...formData, min_interest_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.max_interest_rate}
                onChange={(e) => setFormData({ ...formData, max_interest_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* States Licensed */}
        <div>
          <h3 className="text-lg font-semibold mb-3">States Licensed</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {usStates.map(state => (
              <label key={state} className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.states_licensed.includes(state)}
                  onChange={() => handleStateToggle(state)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{state}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the lender's specializations, target market, and unique features..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding Lender...' : 'Add Lender'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}