'use client';

import { useState } from 'react';
import { SimpleAssessmentService } from '@/lib/services';

interface QuickActionsProps {
  onRefresh: () => void;
}

export function QuickActions({ onRefresh }: QuickActionsProps) {
  const [isRunningQuickAssessment, setIsRunningQuickAssessment] = useState(false);

  const runQuickAssessment = async () => {
    setIsRunningQuickAssessment(true);
    try {
      // Run a sample quick assessment
      const sampleData = {
        creditScore: 650 + Math.floor(Math.random() * 100),
        annualRevenue: 100000 + Math.floor(Math.random() * 400000),
        timeInBusiness: 1 + Math.floor(Math.random() * 5),
        businessStructure: 'LLC',
        hasBusinessPlan: Math.random() > 0.5,
        hasCollateral: Math.random() > 0.3,
        hasBusinessBankAccount: Math.random() > 0.2,
        hasBusinessWebsite: Math.random() > 0.4,
        hasBusinessLicense: Math.random() > 0.3,
        hasEIN: Math.random() > 0.1
      };

      const result = await SimpleAssessmentService.processSimpleAssessment(
        'demo-user',
        sampleData
      );

      if (result.success) {
        onRefresh(); // Refresh dashboard data
        alert(`Quick assessment completed! New score: ${result.data?.overallScore}`);
      } else {
        alert('Assessment failed: ' + result.error);
      }
    } catch (error) {
      alert('Error running assessment: ' + error);
    } finally {
      setIsRunningQuickAssessment(false);
    }
  };

  const actions = [
    {
      title: 'Take Assessment',
      description: 'Complete a comprehensive fundability assessment',
      icon: '📝',
      color: 'blue',
      action: () => window.location.href = '/?assessment=advanced'
    },
    {
      title: 'Quick Check',
      description: 'Run a quick fundability check',
      icon: '⚡',
      color: 'green',
      action: runQuickAssessment,
      loading: isRunningQuickAssessment
    },
    {
      title: 'View Reports',
      description: 'Access your assessment reports',
      icon: '📊',
      color: 'purple',
      action: () => window.location.href = '/reports'
    },
    {
      title: 'Get Funding',
      description: 'Explore funding opportunities',
      icon: '💰',
      color: 'yellow',
      action: () => window.location.href = '/funding'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={action.loading}
            className={`p-4 rounded-lg transition-colors ${getColorClasses(action.color)} ${
              action.loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">
                {action.loading ? '⏳' : action.icon}
              </div>
              <div className="font-semibold text-sm mb-1">
                {action.title}
              </div>
              <div className="text-xs opacity-90">
                {action.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
