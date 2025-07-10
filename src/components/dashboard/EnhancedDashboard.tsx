'use client';

<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, AdvancedAssessmentData } from '../../types/common';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DashboardStats {
  totalAssessments: number;
  latestScore: number;
  averageScore: number;
  improvement: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  score?: number;
}

const EnhancedDashboard: React.FC = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<AdvancedAssessmentData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user and load dashboard data
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

    const fetchDashboardData = async (userId: string) => {
      try {
        // Fetch latest assessment from existing table
        const { data: latestAssessment, error: assessmentError } = await supabase
          .from('advanced_fundability_assessments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assessmentError && assessmentError.code !== 'PGRST116') {
          console.error('Assessment fetch error:', assessmentError);
        } else if (latestAssessment) {
          setLatestAssessment(latestAssessment);
        }

        // Fetch all assessments for stats
        const { data: allAssessments, error: statsError } = await supabase
          .from('advanced_fundability_assessments')
          .select('overall_score, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (statsError) {
          console.error('Stats fetch error:', statsError);
        } else if (allAssessments && allAssessments.length > 0) {
          // Calculate stats
          const scores = allAssessments.map(a => a.overall_score);
          const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          const improvement = scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0;

          setDashboardStats({
            totalAssessments: allAssessments.length,
            latestScore: scores[0],
            averageScore: Math.round(averageScore * 10) / 10,
            improvement: Math.round(improvement)
          });

          // Generate recent activity
          const activities: RecentActivity[] = allAssessments.slice(0, 5).map((assessment, index) => ({
            id: `activity_${index}`,
            type: 'assessment',
            title: `Fundability Assessment #${allAssessments.length - index}`,
            date: new Date(assessment.created_at).toLocaleDateString(),
            score: assessment.overall_score
          }));

          setRecentActivity(activities);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      }
    };

    const loadDashboard = async () => {
      setLoading(true);
      const currentUser = await initializeUser();
      
      if (currentUser) {
        await fetchDashboardData(currentUser.id);
      }
      
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name || user?.email}! Here&apos;s your funding readiness overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Latest Score</dt>
                <dd className={`text-lg font-semibold ${getScoreColor(dashboardStats?.latestScore || 0)}`}>
                  {dashboardStats?.latestScore || 0}/100
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {dashboardStats?.averageScore || 0}/100
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Assessments</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {dashboardStats?.totalAssessments || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Improvement</dt>
                <dd className={`text-lg font-semibold ${
                  (dashboardStats?.improvement || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(dashboardStats?.improvement || 0) >= 0 ? '+' : ''}{dashboardStats?.improvement || 0}
                </dd>
              </dl>
>>>>>>> 9027a76eb338fbaa421c2127d2ecdad194f2bf16
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD
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
=======

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Assessment</h2>
          
          {latestAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(latestAssessment.overall_score)}`}>
                  {latestAssessment.overall_score}/100
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Grade</span>
                <span className="text-lg font-semibold text-gray-900">
                  {getScoreLabel(latestAssessment.overall_score)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(latestAssessment.assessment_date).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Strengths</h3>
                <ul className="text-sm text-green-600 space-y-1">
                  {latestAssessment.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No assessments yet</p>
              <p className="text-sm">Complete your first assessment to see results</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  {activity.score && (
                    <span className={`text-sm font-semibold ${getScoreColor(activity.score)}`}>
                      {activity.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <p>No recent activity</p>
              <p className="text-sm">Your activities will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">New Assessment</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">View Reports</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Get Coaching</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

>>>>>>> 9027a76eb338fbaa421c2127d2ecdad194f2bf16
export default EnhancedDashboard;
