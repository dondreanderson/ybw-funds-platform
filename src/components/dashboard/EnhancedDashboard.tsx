'use client';

import { motion } from 'framer-motion';
import AnalyticsSection from './AnalyticsSection';
import MetricsOverview from './MetricsOverview';
import AssessmentHistory from './AssessmentHistory';

interface EnhancedDashboardProps {
  userId?: string;
  className?: string;
}

export default function EnhancedDashboard({ userId, className = '' }: EnhancedDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fundability Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your business funding readiness and track improvements over time
          </p>
        </div>

        <div className="space-y-8">
          <MetricsOverview />
          <AnalyticsSection />
          <AssessmentHistory />
        </div>
      </div>
    </motion.div>
  );
}
