'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BanknotesIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import BankConnectionWidget from './BankConnectionWidget'
import CreditReportWidget from './CreditReportWidget'

type IntegrationTab = 'bank' | 'credit' | 'accounting' | 'legal'

export default function IntegrationDashboard() {
  const [activeTab, setActiveTab] = useState<IntegrationTab>('bank')

  const integrations = [
    {
      id: 'bank' as IntegrationTab,
      name: 'Bank Connection',
      description: 'Connect bank accounts for financial analysis',
      icon: BanknotesIcon,
      status: 'available',
      color: 'blue'
    },
    {
      id: 'credit' as IntegrationTab,
      name: 'Credit Reports',
      description: 'Business credit scores and reports',
      icon: ShieldCheckIcon,
      status: 'available',
      color: 'green'
    },
    {
      id: 'accounting' as IntegrationTab,
      name: 'Accounting Software',
      description: 'QuickBooks, Xero integration',
      icon: DocumentTextIcon,
      status: 'coming_soon',
      color: 'purple'
    },
    {
      id: 'legal' as IntegrationTab,
      name: 'Legal & Compliance',
      description: 'Business registrations and licenses',
      icon: BuildingOffice2Icon,
      status: 'coming_soon',
      color: 'orange'
    }
  ]

  const getColorClasses = (color: string, active: boolean) => {
    const colors = {
      blue: active 
        ? 'bg-blue-50 border-blue-200 text-blue-700' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200',
      green: active 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-green-200',
      purple: active 
        ? 'bg-purple-50 border-purple-200 text-purple-700' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-purple-200',
      orange: active 
        ? 'bg-orange-50 border-orange-200 text-orange-700' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bank':
        return <BankConnectionWidget />
      case 'credit':
        return <CreditReportWidget />
      case 'accounting':
        return <ComingSoonWidget title="Accounting Integration" />
      case 'legal':
        return <ComingSoonWidget title="Legal & Compliance Integration" />
      default:
        return <BankConnectionWidget />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-2">
              Connect your business tools for comprehensive analysis
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Integration Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {integrations.map((integration) => (
            <motion.button
              key={integration.id}
              onClick={() => setActiveTab(integration.id)}
              disabled={integration.status === 'coming_soon'}
              className={`p-6 rounded-lg border-2 transition-all duration-200 text-left relative ${
                getColorClasses(integration.color, activeTab === integration.id)
              } ${integration.status === 'coming_soon' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              whileHover={integration.status === 'available' ? { scale: 1.02 } : {}}
              whileTap={integration.status === 'available' ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3 mb-2">
                <integration.icon className="w-6 h-6" />
                <span className="font-semibold">{integration.name}</span>
              </div>
              <p className="text-sm opacity-75">{integration.description}</p>
              
              {integration.status === 'coming_soon' && (
                <div className="absolute top-2 right-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  )
}

// Coming Soon Widget
function ComingSoonWidget({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <DocumentTextIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">
        This integration is coming soon. We're working hard to bring you seamless connections to your business tools.
      </p>
      <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg cursor-not-allowed">
        Coming Soon
      </button>
    </div>
  )
}
