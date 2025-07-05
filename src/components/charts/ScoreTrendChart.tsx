import { User, AssessmentData, APIResponse } from "@/types/common";
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendData {
  date: string
  score: number
}

interface ScoreTrendChartProps {
  data?: TrendData[]
}

export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const defaultData = [
    { date: 'Jan', score: 45 },
    { date: 'Feb', score: 52 },
    { date: 'Mar', score: 58 },
    { date: 'Apr', score: 65 },
    { date: 'May', score: 72 },
    { date: 'Jun', score: 78 },
    { date: 'Jul', score: 85 }
  ]

  const chartData = data || defaultData

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip 
          formatter={(value) => [`${value}/100`, 'Fundability Score']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#8B5CF6" 
          strokeWidth={3}
          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
