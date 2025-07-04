'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';
import SimpleFundabilityCalculator from '@/components/SimpleFundabilityCalculator';
import AdvancedFundabilityCalculator from '@/components/AdvancedFundabilityCalculator';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Inline Login Component
function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  // Test users for easy access
  const testUsers = [
    { email: 'admin@ybwfunds.com', password: 'admin123', name: 'YBW Funds Admin (95/100)' },
    { email: 'enterprise@ybwfunds.com', password: 'enterprise123', name: 'Chen Manufacturing (90/100)' },
    { email: 'business@ybwfunds.com', password: 'business123', name: 'TechStart Solutions (85/100)' },
    { email: 'demo@ybwfunds.com', password: 'demo123', name: 'Demo Business LLC (75/100)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="mt-2 text-gray-600">Access your YBW Funds dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Login Buttons */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Login (Test Users):</h3>
          <div className="space-y-2">
            {testUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(user.email);
                  setPassword(user.password);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {user.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [showSimpleCalculator, setShowSimpleCalculator] = useState(false);
  const [showAdvancedCalculator, setShowAdvancedCalculator] = useState(false);
  const [fundabilityScore, setFundabilityScore] = useState(58);
  const [viewMode, setViewMode] = useState<'enhanced' | 'classic'>('enhanced');

  const handleScoreUpdate = (newScore: number) => {
    setFundabilityScore(newScore);
  };

  // Show loading while checking auth
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Classic Dashboard Component (your existing one with real user data)
  const ClassicDashboard = () => (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              YBW Funds Dashboard - {user.business_name || user.name}
            </h1>
            <div className="flex gap-3">
            <button
              onClick={() => setViewMode('enhanced')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Switch to Enhanced View
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fundability Score */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">F</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Fundability Score
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.fundability_score || fundabilityScore}/100
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Funds */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Available Funds
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        $125,000
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Applications */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Applications
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        3
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Fundability Assessment Tools
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Choose the assessment type that best fits your needs. Get actionable insights to improve your business fundability.
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Quick Assessment clicked!');
                      setShowSimpleCalculator(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    ⚡ Quick Assessment (6 questions)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Advanced Assessment clicked!');
                      setShowAdvancedCalculator(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    🎯 Advanced Assessment (125+ criteria)
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Funding explorer coming soon!')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    🔍 Explore Funding Options
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real User Info Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Business Profile
                </h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Business Name:</span>
                    <p className="font-medium">{user.business_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{user.business_phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Website:</span>
                    <p className="font-medium">{user.business_website || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">EIN:</span>
                    <p className="font-medium">{user.business_ein || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Current Score:</span>
                    <p className="font-medium text-blue-600">{user.fundability_score}/100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {viewMode === 'enhanced' ? (
        <div className="relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setViewMode('classic')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors shadow-lg"
            >
              Switch to Classic View
            </button>
          </div>
          <EnhancedDashboard />
        </div>
      ) : (
        <ClassicDashboard />
      )}

      {/* Simple Calculator Modal */}
      {showSimpleCalculator && (
        <SimpleFundabilityCalculator 
          onClose={() => setShowSimpleCalculator(false)}
          onScoreUpdate={handleScoreUpdate}
        />
      )}

      {/* Advanced Calculator Modal */}
      {showAdvancedCalculator && (
        <AdvancedFundabilityCalculator 
          onClose={() => setShowAdvancedCalculator(false)}
          onScoreUpdate={handleScoreUpdate}
        />
      )}
    </>
  );
}