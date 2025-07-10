'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import AddLenderForm from './AddLenderForm'
import AddTradelineForm from './AddTradelineForm'

export default function MarketplaceAdmin() {
  const [activeTab, setActiveTab] = useState('overview')
  const [providers, setProviders] = useState([]) // Load from API

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'lenders', name: 'Manage Lenders', icon: BuildingOfficeIcon },
    { id: 'tradelines', name: 'Manage Tradelines', icon: CreditCardIcon },
    { id: 'providers', name: 'Providers', icon: UsersIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace Administration</h1>
          <p className="text-gray-600 mt-2">Manage lenders, tradelines, and marketplace content</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'lenders' && <LendersTab />}
            {activeTab === 'tradelines' && <TradeLinesTab providers={providers} />}
            {activeTab === 'providers' && <ProvidersTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Active Lenders</p>
            <p className="text-2xl font-bold text-blue-900">24</p>
          </div>
          <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Available Tradelines</p>
            <p className="text-2xl font-bold text-green-900">156</p>
          </div>
          <CreditCardIcon className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium">Applications</p>
            <p className="text-2xl font-bold text-purple-900">89</p>
          </div>
          <UsersIcon className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-orange-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-600 text-sm font-medium">Revenue</p>
            <p className="text-2xl font-bold text-orange-900">$12.5K</p>
          </div>
          <ChartBarIcon className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>
  )
}

function LendersTab() {
  return (
    <div>
      <AddLenderForm onSubmit={() => {
        // Refresh lenders list
        console.log('Lender added, refreshing list...')
      }} />
    </div>
  )
}

function TradeLinesTab({ providers }: { providers: any[] }) {
  return (
    <div>
      <AddTradelineForm 
        providers={providers}
        onSubmit={() => {
          // Refresh tradelines list
          console.log('Tradeline added, refreshing list...')
        }} 
      />
    </div>
  )
}

function ProvidersTab() {
  return (
    <div className="text-center py-12">
      <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Provider Management</h3>
      <p className="text-gray-600">Coming soon - manage tradeline providers</p>
    </div>
  )
}