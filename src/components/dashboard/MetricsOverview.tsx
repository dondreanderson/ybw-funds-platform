import { User, AssessmentData, APIResponse } from "@/types/common";
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, FileText, Shield, Users, Building } from 'lucide-react';
import MetricCard from '../charts/MetricCard';
import FundabilityScoreGauge from '../charts/FundabilityScoreGauge';
import { realAssessmentService, type AssessmentWithCategories } from '@/lib/services/realAssessmentService';

interface MetricsOverviewProps {
  assessment: AssessmentWithCategories | null;
}

export default function MetricsOverview({ assessment }: MetricsOverviewProps) {
  if (!assessment) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 text-center py-8 text-gray-500">
          No assessment data available
        </div>
      </div>
    );
  }

  const { categoryData, overallScore, metrics } = realAssessmentService.transformToChartData(assessment);

  // Map categories to icons
  const iconMap = {
    'Business Registration': TrendingUp,
    'Credit Profile': DollarSign,
    'Financial Documentation': FileText,
    'Operational Infrastructure': Shield,
    'Online Presence': Users,
    'Risk & Compliance': Building,
    'Credit': DollarSign,
    'Financial': FileText,
    'Business Plan': TrendingUp,
    'Collateral': Shield,
    'Management': Users,
    'Industry': Building
  };

  const getIcon = (title: string) => {
    return iconMap[title as keyof typeof iconMap] || TrendingUp;
  };

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
            <FundabilityScoreGauge score={overallScore} size={180} />
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              Assessment Version: {assessment.assessment_version || '2.0'}
            </div>
            <div className="text-sm text-gray-600">
              Completion: {assessment.completion_percentage || 100}%
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.slice(0, 6).map((metric, index) => (
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
              icon={getIcon(metric.title)}
              color={metric.color}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
