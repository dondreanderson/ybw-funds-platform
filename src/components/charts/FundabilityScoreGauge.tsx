'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface FundabilityScoreGaugeProps {
  score: number
  size?: number
}

export default function FundabilityScoreGauge({ score, size = 200 }: FundabilityScoreGaugeProps) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ]

  const COLORS = ['#8B5CF6', '#E5E7EB']

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981' // Green
    if (score >= 60) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  return (
    <div className="relative">
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="90%"
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getScoreColor(score)} />
            <Cell fill={COLORS[1]} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{score}</div>
          <div className="text-sm text-gray-600">/ 100</div>
        </div>
      </div>
    </div>
  )
}
