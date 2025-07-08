'use client';

import type { UserProfile, BusinessProfile } from '@/lib/types/core';

interface RecentActivityProps {
  assessmentHistory: any[];
  userProfile: (UserProfile & { business_profile?: BusinessProfile }) | null;
}

export function RecentActivity({ assessmentHistory, userProfile }: RecentActivityProps) {
  // Generate some mock recent activities
  const recentActivities = [
    {
      type: 'assessment',
      title: 'Completed Fundability Assessment',
      description: `Score: ${userProfile?.fundability_score || 0}/100`,
      timestamp: new Date().toISOString(),
      icon: '📊',
      color: 'blue'
    },
    {
      type: 'profile',
      title: 'Updated Business Profile',
      description: `${userProfile?.business_profile?.business_structure || 'Business'} in ${userProfile?.business_profile?.industry || 'General'} industry`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: '🏢',
      color: 'green'
    },
    {
      type: 'recommendation',
      title: 'New Recommendations Available',
      description: 'Based on your latest assessment results',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: '💡',
      color: 'yellow'
    },
    {
      type: 'milestone',
      title: 'Achievement Unlocked',
      description: 'Completed first assessment',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: '🏆',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className={`p-2 rounded-full ${getColorClasses(activity.color)}`}>
              <span className="text-sm">{activity.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Business Profile Summary */}
      {userProfile?.business_profile && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Business Overview
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Structure:</span>
              <span className="ml-2 font-medium">
                {userProfile.business_profile.business_structure}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Industry:</span>
              <span className="ml-2 font-medium">
                {userProfile.business_profile.industry}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Years in Business:</span>
              <span className="ml-2 font-medium">
                {userProfile.business_profile.years_in_business} years
              </span>
            </div>
            <div>
              <span className="text-gray-500">Employees:</span>
              <span className="ml-2 font-medium">
                {userProfile.business_profile.employees_count}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
