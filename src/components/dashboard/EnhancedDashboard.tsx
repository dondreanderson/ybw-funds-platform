'use client';

import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  HomeIcon, 
  ChartBarIcon, 
  ShoppingBagIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  BanknotesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  userProfile: any;
  latestAssessment: any;
  stats: {
    currentScore: number;
    scoreChange: number;
    totalAssessments: number;
    lastAssessmentDate: string | null;
  };
  loading: boolean;
  error: string | null;
}

const tabs = [
  { name: 'Overview', icon: HomeIcon },
  { name: 'AI Assessment', icon: ChartBarIcon },
  { name: 'Marketplace', icon: ShoppingBagIcon },
  { name: 'Reports', icon: DocumentTextIcon },
];

export function EnhancedDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            YBW Funds Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor your business fundability and growth opportunities
          </p>
        </div>

        {/* Tabs */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                    selected
                      ? 'bg-white shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel>
              <OverviewTab data={dashboardData} />
            </Tab.Panel>
            <Tab.Panel>
              <AssessmentTab />
            </Tab.Panel>
            <Tab.Panel>
              <MarketplaceTab />
            </Tab.Panel>
            <Tab.Panel>
              <ReportsTab />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

// Quick Stats Card Component
function QuickStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  color = 'blue' 
}: { 
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  change?: number;
  color?: 'green' | 'blue' | 'purple' | 'red';
}) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }: { data: DashboardData | null }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatsCard
          title="Current Score"
          value={data?.stats.currentScore || 0}
          icon={ChartBarIcon}
          change={data?.stats.scoreChange}
          color="blue"
        />
        <QuickStatsCard
          title="Total Assessments"
          value={data?.stats.totalAssessments || 0}
          icon={DocumentTextIcon}
          color="green"
        />
        <QuickStatsCard
          title="Improvement Areas"
          value={3}
          icon={ArrowTrendingUpIcon}
          color="purple"
        />
        <QuickStatsCard
          title="Funding Potential"
          value="$50K"
          icon={BanknotesIcon}
          color="green"
        />
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back to YBW Funds! 🚀
        </h2>
        <p className="text-blue-100 mb-4">
          Your business fundability score has improved by 12 points this month. 
          Keep up the great work!
        </p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">
          Take New Assessment
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Assessment completed - Score: 85/100
              </span>
              <span className="text-xs text-gray-400">2 days ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Banking relationship updated
              </span>
              <span className="text-xs text-gray-400">1 week ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Digital presence improved
              </span>
              <span className="text-xs text-gray-400">2 weeks ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assessment Tab Component
function AssessmentTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Assessment</h2>
      <p className="text-gray-600 mb-4">
        Take our comprehensive AI-powered assessment to discover your funding potential.
      </p>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Start Assessment
      </button>
    </div>
  );
}

// Marketplace Tab Component
function MarketplaceTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Funding Marketplace</h2>
      <p className="text-gray-600">
        Explore funding opportunities tailored to your business.
      </p>
    </div>
  );
}

// Reports Tab Component
function ReportsTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Reports & Analytics</h2>
      <p className="text-gray-600">
        View detailed reports and track your progress over time.
      </p>
    </div>
  );
}

// Action Button Component
function ActionButton({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  color = 'blue' 
}: { 
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 border-transparent hover:border-current transition-colors ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-6 w-6" />
        <div className="text-left">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm opacity-75">{description}</p>
        </div>
      </div>
    </button>
  );
}

// Export as default
export default EnhancedDashboard;
