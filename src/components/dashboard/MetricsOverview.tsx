'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types/common';

// Define allowed color types
type ColorType = 'blue' | 'green' | 'purple' | 'yellow';

interface Metric {
  title: string;
  value: string | number;
  change: string;
  color: ColorType;
  description?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: ColorType;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color, delay = 0 }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      icon: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      icon: 'bg-green-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      icon: 'bg-purple-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      icon: 'bg-yellow-100'
    }
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${classes.bg} ${classes.border} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${classes.icon} p-3 rounded-full`}>
            <div className={classes.text}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-medium ${
            change.startsWith('+') ? 'text-green-600' : 
            change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </span>
          <p className="text-xs text-gray-500">vs last month</p>
        </div>
      </div>
    </motion.div>
  );
};

const MetricsOverview: React.FC = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user and load metrics
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Mock user - replace with your actual auth
        const mockUser: User = {
          id: 'user_123',
          email: 'user@example.com',
          name: 'John Doe'
        };
        setUser(mockUser);
        return mockUser;
      } catch (error) {
        console.error('Failed to initialize user:', error);
        setError('Failed to load user data');
        return null;
      }
    };

    const loadMetrics = async () => {
      setLoading(true);
      const currentUser = await initializeUser();
      
      if (currentUser) {
        try {
          // Mock metrics data - replace with actual API calls
          const metricsData: Metric[] = [
            {
              title: 'Fundability Score',
              value: 85,
              change: '+12%',
              color: 'blue',
              description: 'Your overall funding readiness score'
            },
            {
              title: 'Credit Rating',
              value: 'A-',
              change: '+1 grade',
              color: 'green',
              description: 'Your business credit rating'
            },
            {
              title: 'Assessments',
              value: 7,
              change: '+2',
              color: 'purple',
              description: 'Total completed assessments'
            },
            {
              title: 'Recommendations',
              value: 12,
              change: '+4',
              color: 'yellow',
              description: 'Active improvement recommendations'
            }
          ];

          setMetrics(metricsData);
        } catch (error) {
          console.error('Failed to load metrics:', error);
          setError('Failed to load metrics data');
        }
      }
      
      setLoading(false);
    };

    loadMetrics();
  }, []);

  // Icon helper function
  const getIcon = (title: string): React.ReactNode => {
    switch (title) {
      case 'Fundability Score':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'Credit Rating':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'Assessments':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Recommendations':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Metrics</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metrics Overview</h2>
          <p className="text-gray-600">Track your funding readiness progress</p>
        </div>
        <div className="text-sm text-gray-500">
          Welcome, {user?.name || user?.email}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div key={metric.title}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={getIcon(metric.title)}
              color={metric.color}
              delay={index * 0.1}
            />
          </motion.div>
        ))}
      </div>

      {/* Additional insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Insights & Recommendations</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Your fundability score has improved by 12% this month - great progress!</p>
              <p>• Consider completing 2 more assessments to unlock premium recommendations.</p>
              <p>• Your credit rating improvement puts you in the top 25% of users.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
