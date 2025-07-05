import { User, AssessmentData, APIResponse } from "@/types/common";
'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface CategoryData {
  category: string
  score: number
  fullMark: 100
}

interface CategoryRadarChartProps {
  data?: CategoryData[]
}

export default function CategoryRadarChart({ data }: CategoryRadarChartProps) {
  const defaultData = [
    { category: 'Business Registration', score: 85, fullMark: 100 },
    { category: 'Credit Profile', score: 70, fullMark: 100 },
    { category: 'Financial Documentation', score: 75, fullMark: 100 },
    { category: 'Operations', score: 80, fullMark: 100 },
    { category: 'Online Presence', score: 65, fullMark: 100 },
    { category: 'Risk Compliance', score: 90, fullMark: 100 }
  ]

  const chartData = data || defaultData

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fontSize: 10 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#8B5CF6"
          fill="#8B5CF6"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
