'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-80 ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {data.map((item, index) => (
            <Pie
              key={index}
              data={[
                { name: item.name, value: item.value },
                { name: 'remaining', value: 100 - item.value }
              ]}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={40 + index * 20}
              outerRadius={55 + index * 20}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={item.color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          ))}
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Progress</div>
          <div className="text-sm text-gray-500">Overview</div>
        </div>
      </div>
    </motion.div>
  );
}
