'use client'

import { useRouter } from 'next/navigation'
import { useDashboardData } from '@/hooks/useDashboardData'

export function DashboardOverview() {
  const router = useRouter()
  const { stats, loading, error } = useDashboardData()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your funding dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Current Score</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.currentScore}/100</p>
          <p className="text-sm text-gray-500">+{stats.scoreChange} from last assessment</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Assessments</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalAssessments}</p>
          <p className="text-sm text-gray-500">Completed assessments</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Last Assessment</h3>
          <p className="text-lg font-medium text-gray-900">
            {stats.lastAssessmentDate ? new Date(stats.lastAssessmentDate).toLocaleDateString() : 'No assessments yet'}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/assessment')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            Start New Assessment
          </button>
          
          <button
            onClick={() => router.push('/marketplace')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Browse Lenders
          </button>
          
          <button
            onClick={() => router.push('/reports')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}
