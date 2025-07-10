'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface IntegrationStatus {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  lastSync: string | null
  dataPoints: number
  errorMessage?: string
}

export default function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegrationStatus()
  }, [])

  const loadIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status')
      const data = await response.json()
      
      if (data.success) {
        setIntegrations(data.data)
      }
    } catch (error) {
      console.error('Error loading integration status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'disconnected':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50'
      case 'disconnected':
        return 'text-gray-600 bg-gray-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Integration Status</h3>
      
      <div className="space-y-4">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(integration.status)}
              <div>
                <h4 className="font-medium">{integration.name}</h4>
                <p className="text-sm text-gray-600">
                  {integration.status === 'connected' && integration.lastSync ? 
                    `Last sync: ${new Date(integration.lastSync).toLocaleString()}` :
                    integration.errorMessage || 'Not connected'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {integration.status === 'connected' && (
                <div className="text-right">
                  <p className="text-sm font-medium">{integration.dataPoints}</p>
                  <p className="text-xs text-gray-500">data points</p>
                </div>
              )}
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {integrations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No integrations configured yet</p>
          <p className="text-sm text-gray-400">Connect your business tools to get started</p>
        </div>
      )}
    </div>
  )
}
