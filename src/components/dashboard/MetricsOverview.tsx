'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, FileText, Shield, Users, Building } from 'lucide-react';
import MetricCard from '../charts/MetricCard';
import FundabilityScoreGauge from '../charts/FundabilityScoreGauge';

export default function MetricsOverview() {
  const metrics = [
    {
      title: 'Credit Profile',
      value: '85',
      change: 12,
      icon: TrendingUp,
      color: '#10b981'
    },
    {
      title: 'Financial Health',
      value: '78',
      change: 8,
      icon: DollarSign,
      color: '#3b82f6'
    },
    {
      title: 'Documentation',
      value: '92',
      change: 15,
      icon: FileText,
      color: '#8b5cf6'
    },
    {
      title: 'Collateral',
      value: '65',
      change: -3,
      icon: Shield,
      color: '#f59e0b'
    },
    {
      title: 'Management',
      value: '88',
      change: 6,
      icon: Users,
      color: '#ef4444'
    },
    {
      title: 'Industry Risk',
      value: '73',
      change: 4,
      icon: Building,
      color: '#06b6d4'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Overall Score */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Overall Fundability Score
          </h3>
          <div className="flex justify-center">
            <FundabilityScoreGauge score={82} size={180} />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              color={metric.color}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
