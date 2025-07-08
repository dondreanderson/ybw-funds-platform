'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface CategoryRadarChartProps {
  categoryScores: Record<string, number>;
  loading?: boolean;
}

export function CategoryRadarChart({ categoryScores, loading }: CategoryRadarChartProps) {
  const chartData = React.useMemo(() => {
    // Default categories if no data
    const defaultCategories = {
      'Business Foundation': 57,
      'Banking & Finance': 35,
      'Business Credit Profile': 50,
      'Marketing Presence': 67,
      'Documentation': 67
    };

    const scores = Object.keys(categoryScores).length > 0 ? categoryScores : defaultCategories;
    
    return Object.entries(scores).map(([category, score]) => ({
      category: category.replace(' & ', '\n& '), // Line break for better display
      score: score,
      fullMark: 100
    }));
  }, [categoryScores]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
        <div className="text-sm text-gray-500">
          Scale: 0-100 points
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: '#374151', fontSize: 12 }}
              className="text-xs"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#6B7280', fontSize: 10 }}
            />
            <Radar
              name="Your Score"
              dataKey="score"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 1, r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Category breakdown */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {item.category.replace('\n', ' ')}
            </span>
            <div className="flex items-center">
              <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className={`h-2 rounded-full ${
                    item.score >= 80 ? 'bg-green-500' :
                    item.score >= 60 ? 'bg-yellow-500' :
                    item.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900">{item.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}