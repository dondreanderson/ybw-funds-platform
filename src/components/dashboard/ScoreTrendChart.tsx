'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ScoreTrendData {
  date: string;
  score: number;
  assessmentType: string;
}

interface ScoreTrendChartProps {
  data: ScoreTrendData[];
  loading?: boolean;
}

export function ScoreTrendChart({ data, loading }: ScoreTrendChartProps) {
  // Generate sample trend data if no real data available
  const sampleData = React.useMemo(() => {
    const today = new Date();
    return [
      { date: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString(), score: 45, assessmentType: 'Initial' },
      { date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString(), score: 52, assessmentType: 'Follow-up' },
      { date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), score: 58, assessmentType: 'Progress' },
      { date: today.toLocaleDateString(), score: data.length > 0 ? data[data.length - 1].score : 60, assessmentType: 'Current' }
    ];
  }, [data]);

  const chartData = data.length > 0 ? data : sampleData;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Score Trend</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Fundability Score</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#6B7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              formatter={(value: number, name: string) => [
                `${value} points`, 
                'Fundability Score'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#scoreGradient)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Best Score</p>
          <p className="text-lg font-bold text-green-800">
            {Math.max(...chartData.map(d => d.score))}
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Current</p>
          <p className="text-lg font-bold text-blue-800">
            {chartData[chartData.length - 1]?.score || 0}
          </p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Improvement</p>
          <p className="text-lg font-bold text-purple-800">
            +{chartData.length > 1 ? 
              chartData[chartData.length - 1].score - chartData[0].score : 0}
          </p>
        </div>
      </div>
    </div>
  );
}