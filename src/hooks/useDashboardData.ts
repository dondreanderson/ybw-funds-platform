'use client'

import { useState, useEffect } from 'react'

export interface DashboardData {
  userProfile: any
  latestAssessment: any
  stats: {
    currentScore: number
    scoreChange: number
    totalAssessments: number
    lastAssessmentDate: string | null
  }
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    userProfile: null,
    latestAssessment: null,
    stats: {
      currentScore: 0,
      scoreChange: 0,
      totalAssessments: 0,
      lastAssessmentDate: null,
    },
    loading: false,
    error: null,
    refresh: () => {},
  })

  const refresh = () => {
    // Mock data for now
    setData(prev => ({
      ...prev,
      stats: {
        currentScore: 75,
        scoreChange: 5,
        totalAssessments: 3,
        lastAssessmentDate: new Date().toISOString(),
      },
      loading: false,
    }))
  }

  useEffect(() => {
    refresh()
  }, [])

  return { ...data, refresh }
}
