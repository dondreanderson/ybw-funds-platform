'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface TradelineFormData {
  provider_id: string
  tradeline_type: string
  account_type: string
  creditor_name: string
  credit_limit: number
  current_balance: number
  account_age_years: number
  payment_history_months: number
  reports_to_bureaus: string[]
  available_spots: number
  spot_duration_months: number
  spot_price: number
  setup_fee: number
  min_credit_score: number
}

export default function AddTradelineForm({ providers, onSubmit }: {
  providers: any[]
  onSubmit?: () => void
}) {
  const [formData, setFormData] = useState<TradelineFormData>({
    provider_id: '',
    tradeline_type: 'authorized_user',
    account_type: 'credit_card',
    creditor_name: '',
    credit_limit: 10000,
    current_balance: 1000,
    account_age_years: 5,
    payment_history_months: 60,
    reports_to_bureaus: ['experian'],
    available_spots: 5,
    spot_duration_months: 12,
    spot_price: 500,
    setup_fee: 0,
    min_credit_score: 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tradelineTypes = [
    { value: 'authorized_user', label: 'Authorized User' },
    { value: 'business_account', label: 'Business Account' },
    { value: 'supplier_account', label: 'Supplier Account' },
    { value: 'utility_account', label: 'Utility Account' }
  ]

  const accountTypes = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'line_of_credit', label: 'Line of Credit' },
    { value: 'installment_loan', label: 'Installment Loan' },
    { value: 'supplier_net30', label: 'Supplier Net 30' },
    { value: 'utility', label: 'Utility Account' }
  ]

  const creditBureaus = [
    { value: 'experian', label: 'Experian' },
    { value: 'equifax', label: 'Equifax' },
    { value: 'dun_bradstreet', label: 'Dun & Bradstreet' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/marketplace/tradelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          utilization_percentage: (formData.current_balance / formData.credit_limit) * 100,
          perfect_payment_history: true
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Tradeline added successfully!')
        onSubmit?.()
        // Reset form
        setFormData({
          provider_id: '',
          tradeline_type: 'authorized_user',
          account_type: 'credit_card',
          creditor_name: '',
          credit_limit: 10000,
          current_balance: 1000,
          account_age_years: 5,
          payment_history_months: 60,
          reports_to_bureaus: ['experian'],
          available_spots: 5,
          spot_duration_months: 12,
          spot_price: 500,
          setup_fee: 0,
          min_credit_score: 0
        })
      } else {
        setError(data.error || 'Failed to add tradeline')
      }
    } catch (error) {
      setError('Failed to add tradeline')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBureauToggle = (bureau: string) => {
    setFormData(prev => ({
      ...prev,
      reports_to_bureaus: prev.reports_to_bureaus.includes(bureau)
        ? prev.reports_to_bureaus.filter(b => b !== bureau)
        : [...prev.reports_to_bureaus, bureau]
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold mb-6">Add New Tradeline</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider and Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider *
            </label>
            <select
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tradeline Type *
            </label>
            <select
              value={formData.tradeline_type}
              onChange={(e) => setFormData({ ...formData, tradeline_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {tradelineTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type *
            </label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creditor Name *
            </label>
            <input
              type="text"
              value={formData.creditor_name}
              onChange={(e) => setFormData({ ...formData, creditor_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Chase, Bank of America"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Limit ($)
            </label>
            <input
              type="number"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance ($)
            </label>
            <input
              type="number"
              value={formData.current_balance}
              onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilization (%)
            </label>
            <input
              type="text"
              value={`${((formData.current_balance / formData.credit_limit) * 100).toFixed(1)}%`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>

        {/* History and Reporting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Age (Years)
            </label>
            <input
              type="number"
              value={formData.account_age_years}
              onChange={(e) => setFormData({ ...formData, account_age_years: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment History (Months)
            </label>
            <input
              type="number"
              value={formData.payment_history_months}
              onChange={(e) => setFormData({ ...formData, payment_history_months: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* Credit Bureaus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Reports to Credit Bureaus
          </label>
          <div className="grid grid-cols-3 gap-4">
            {creditBureaus.map(bureau => (
              <label key={bureau.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reports_to_bureaus.includes(bureau.value)}
                  onChange={() => handleBureauToggle(bureau.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{bureau.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Spots
            </label>
            <input
              type="number"
              value={formData.available_spots}
              onChange={(e) => setFormData({ ...formData, available_spots: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Months)
            </label>
            <input
              type="number"
              value={formData.spot_duration_months}
              onChange={(e) => setFormData({ ...formData, spot_duration_months: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spot Price ($)
            </label>
            <input
              type="number"
              value={formData.spot_price}
              onChange={(e) => setFormData({ ...formData, spot_price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setup Fee ($)
            </label>
            <input
              type="number"
              value={formData.setup_fee}
              onChange={(e) => setFormData({ ...formData, setup_fee: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Credit Score
          </label>
          <input
            type="number"
            value={formData.min_credit_score}
            onChange={(e) => setFormData({ ...formData, min_credit_score: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="850"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding Tradeline...' : 'Add Tradeline'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}