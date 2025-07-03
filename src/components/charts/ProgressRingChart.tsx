'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ProgressData {
  name: string;
  value: number;
  color: string;
}

interface ProgressRingChartProps {
  data: ProgressData[];
  className?: string;
}

export default function ProgressRingChart({ data, className = '' }: ProgressRingChartProps) {
  // Create data for each ring with proper structure
  const createRingData = (item: ProgressData) => [
    { name: item.name, value: item.value, fill: item.color },
    { name: 'remaining', value: 100 - item.value, fill: '#e5e7eb' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-80 relative ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {data.map((item, index) => (
            <Pie
              key={`ring-${index}`}
              data={createRingData(item)}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={40 + index * 25}
              outerRadius={55 + index * 25}
              paddingAngle={0}
              dataKey="value"
            >
              {createRingData(item).map((entry, entryIndex) => (
                <Cell key={`cell-${index}-${entryIndex}`} fill={entry.fill} />
              ))}
            </Pie>
          ))}
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => {
              const dataItem = data.find(d => d.name === value);
              return dataItem ? `${value}: ${dataItem.value}%` : value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-lg font-semibold text-gray-900">Progress</div>
        <div className="text-sm text-gray-500">Overview</div>
      </div>
    </motion.div>
  );
}
