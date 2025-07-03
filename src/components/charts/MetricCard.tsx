'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: string;
  className?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = '#3b82f6',
  className = '' 
}: MetricCardProps) {
  const changeColor = change && change > 0 ? '#10b981' : '#ef4444';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={24} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        
        {change !== undefined && (
          <div className="text-right">
            <span 
              className="text-sm font-medium"
              style={{ color: changeColor }}
            >
              {change > 0 ? '+' : ''}{change}%
            </span>
            <p className="text-xs text-gray-500">vs last month</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
