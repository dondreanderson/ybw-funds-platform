'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IndustryBenchmarkProps {
  userScore: number;
  industry?: string;
  loading?: boolean;
}

interface BenchmarkData {
  average: number;
  top25: number;
  top10: number;
}

export function IndustryBenchmark({ userScore, industry = 'Technology', loading }: IndustryBenchmarkProps) {
  const benchmarkData = React.useMemo(() => {
    // Industry benchmark data with proper typing
    const industryBenchmarks: Record<string, BenchmarkData> = { // ✅ Fixed: Added proper type annotation
      'Technology': { average: 72, top25: 85, top10: 92 },
      'Retail': { average: 68, top25: 82, top10: 89 },
      'Manufacturing': { average: 71, top25: 84, top10: 91 },
      'Healthcare': { average: 74, top25: 87, top10: 94 },
      'Financial Services': { average: 76, top25: 88, top10: 95 },
      'Professional Services': { average: 73, top25: 86, top10: 93 }
    };

    const benchmark = industryBenchmarks[industry] || industryBenchmarks['Technology'];
    
    return [
      { name: 'Your Score', value: userScore, color: '#3B82F6' },
      { name: 'Industry Average', value: benchmark.average, color: '#6B7280' },
      { name: 'Top 25%', value: benchmark.top25, color: '#F59E0B' },
      { name: 'Top 10%', value: benchmark.top10, color: '#10B981' }
    ];
  }, [userScore, industry]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const userPercentile = React.useMemo(() => {
    const industryAvg = benchmarkData[1].value;
    const top25 = benchmarkData[2].value;
    const top10 = benchmarkData[3].value;
    
    if (userScore >= top10) return 'Top 10%';
    if (userScore >= top25) return 'Top 25%';
    if (userScore >= industryAvg) return 'Above Average';
    return 'Below Average';
  }, [userScore, benchmarkData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Industry Benchmark</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">{industry} Industry</p>
          <p className={`text-sm font-medium ${
            userPercentile.includes('Top') ? 'text-green-600' : 
            userPercentile === 'Above Average' ? 'text-blue-600' : 'text-orange-600'
          }`}>
            You're in the {userPercentile}
          </p>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={benchmarkData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
            <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value} points`, 'Score']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {benchmarkData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Gap to Top 25%</p>
          <p className="text-lg font-bold text-blue-800">
            {Math.max(0, benchmarkData[2].value - userScore)} points
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Gap to Top 10%</p>
          <p className="text-lg font-bold text-green-800">
            {Math.max(0, benchmarkData[3].value - userScore)} points
          </p>
        </div>
      </div>
    </div>
  );
}
