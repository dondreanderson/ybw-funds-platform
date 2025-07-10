'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BanknotesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface BankAccount {
  account_id: string
  name: string
  type: string
  subtype: string
  mask: string
  balance: {
    available: number | null
    current: number
    iso_currency_code: string
  }
}

interface BankMetrics {
  averageMonthlyRevenue: number
  averageMonthlyExpenses: number
  cashFlow: number
  revenueGrowth: number
  expenseRatio: number
}

export default function BankConnectionWidget() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [metrics, setMetrics] = useState<BankMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showBalances, setShowBalances] = useState(false)

  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      const response = await fetch('/api/integrations/bank/status')
      const data = await response.json()
      
      if (data.success && data.data.isConnected) {
        setIsConnected(true)
        setAccounts(data.data.accounts || [])
        setMetrics(data.data.metrics || null)
      }
    } catch (error) {
      console.error('Error checking bank connection:', error)
    }
  }

  const connectBank = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get Plaid link token
      const tokenResponse = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_plaid_link_token' })
      })

      const tokenData = await tokenResponse.json()
      
      if (!tokenData.success) {
        throw new Error('Failed to create bank connection token')
      }

      // Open Plaid Link (this would normally use the Plaid Link SDK)
      // For demo purposes, we'll simulate the connection
      await simulatePlaidConnection(tokenData.data.link_token)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect bank')
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate Plaid connection for demo
  const simulatePlaidConnection = async (linkToken: string) => {
    // In production, this would open Plaid Link
    // For now, we'll simulate a successful connection
    
    const mockPublicToken = 'public-sandbox-token'
    
    // Exchange public token for access token
    const exchangeResponse = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'exchange_plaid_token',
        publicToken: mockPublicToken
      })
    })

    const exchangeData = await exchangeResponse.json()
    
    if (exchangeData.success) {
      // Fetch bank data
      await fetchBankData()
      setIsConnected(true)
    } else {
      throw new Error('Failed to establish bank connection')
    }
  }

  const fetchBankData = async () => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get_bank_data',
          accessToken: 'mock-access-token' // In production, get from secure storage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setAccounts(data.data.accounts)
        setMetrics(data.data.metrics)
      }
    } catch (error) {
      console.error('Error fetching bank data:', error)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    await fetchBankData()
    setIsLoading(false)
  }

  const disconnectBank = async () => {
    try {
      const response = await fetch('/api/integrations/bank/disconnect', {
        method: 'POST'
      })

      if (response.ok) {
        setIsConnected(false)
        setAccounts([])
        setMetrics(null)
      }
    } catch (error) {
      console.error('Error disconnecting bank:', error)
    }
  }

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="text-center">
          <BanknotesIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Bank Account</h3>
          <p className="text-gray-600 mb-6">
            Securely connect your bank account to get accurate financial insights and improve your fundability score.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </motion.div>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">What we'll analyze:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Monthly revenue and expenses</li>
              <li>• Cash flow patterns</li>
              <li>• Account balances and history</li>
              <li>• Revenue growth trends</li>
            </ul>
          </div>

          <button
            onClick={connectBank}
            disabled={isLoading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                🔒 Connect Bank Securely
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            🔒 Bank-level security • Read-only access • Powered by Plaid
          </p>
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
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-8 h-8 text-green-500" />
          <div>
            <h3 className="text-xl font-semibold">Bank Connected</h3>
            <p className="text-gray-600">Real-time financial data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title={showBalances ? 'Hide balances' : 'Show balances'}
          >
            {showBalances ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Financial Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Monthly Revenue"
            value={`$${metrics.averageMonthlyRevenue.toLocaleString()}`}
            change={`${metrics.revenueGrowth > 0 ? '+' : ''}${metrics.revenueGrowth.toFixed(1)}%`}
            positive={metrics.revenueGrowth >= 0}
          />
          <MetricCard
            title="Monthly Expenses"
            value={`$${metrics.averageMonthlyExpenses.toLocaleString()}`}
            change={`${metrics.expenseRatio.toFixed(1)}% of revenue`}
            positive={metrics.expenseRatio < 70}
          />
          <MetricCard
            title="Cash Flow"
            value={`$${metrics.cashFlow.toLocaleString()}`}
            change={metrics.cashFlow > 0 ? 'Positive' : 'Negative'}
            positive={metrics.cashFlow > 0}
          />
        </div>
      )}

      {/* Bank Accounts */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Connected Accounts</h4>
        {accounts.map((account, index) => (
          <motion.div
            key={account.account_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">{account.name}</h5>
                <p className="text-sm text-gray-600 capitalize">
                  {account.type} • {account.subtype} • •••{account.mask}
                </p>
              </div>
              <div className="text-right">
                {showBalances ? (
                  <>
                    <p className="text-lg font-semibold">
                      ${account.balance.current.toLocaleString()}
                    </p>
                    {account.balance.available && (
                      <p className="text-sm text-gray-600">
                        ${account.balance.available.toLocaleString()} available
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400">••••••</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <button
          onClick={disconnectBank}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Disconnect Bank
        </button>
        <p className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </motion.div>
  )
}

// Metric Card Component
function MetricCard({ title, value, change, positive }: {
  title: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </p>
    </div>
  )
}