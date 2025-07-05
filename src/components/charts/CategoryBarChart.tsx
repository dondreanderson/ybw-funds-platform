import { User, AssessmentData, APIResponse } from "@/types/common";
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface CategoryData {
  category: string;
  score: number;
  benchmark: number;
}

interface CategoryBarChartProps {
  data: CategoryData[];
  className?: string;
}

export default function CategoryBarChart({ data, className = '' }: CategoryBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full h-80 ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            type="category"
            dataKey="category"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={120}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Bar dataKey="benchmark" fill="#e5e7eb" name="Industry Benchmark" />
          <Bar dataKey="score" fill="#3b82f6" name="Your Score" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
