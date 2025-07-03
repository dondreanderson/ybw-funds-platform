'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface FundabilityScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  className?: string;
}

export default function FundabilityScoreGauge({ 
  score, 
  maxScore = 100, 
  size = 200, 
  className = '' 
}: FundabilityScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;
  
  const data = [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Amber
    if (score >= 40) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={scoreColor} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <div className="text-3xl font-bold text-gray-900" style={{ color: scoreColor }}>
            {score}
          </div>
          <div className="text-sm text-gray-500">
            out of {maxScore}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
