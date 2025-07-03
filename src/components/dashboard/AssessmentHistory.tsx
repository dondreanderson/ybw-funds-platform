'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AssessmentRecord {
  id: string;
  date: string;
  overallScore: number;
  change: number;
  categories: {
    name: string;
    score: number;
    change: number;
  }[];
}

export default function AssessmentHistory() {
  const history: AssessmentRecord[] = [
    {
      id: '1',
      date: '2024-06-15',
      overallScore: 82,
      change: 4,
      categories: [
        { name: 'Credit Profile', score: 85, change: 5 },
        { name: 'Financial Health', score: 78, change: 3 },
        { name: 'Business Plan', score: 92, change: 8 },
        { name: 'Collateral', score: 65, change: -2 },
        { name: 'Management', score: 88, change: 6 },
        { name: 'Industry Risk', score: 73, change: 4 }
      ]
    },
    {
      id: '2',
      date: '2024-05-15',
      overallScore: 78,
      change: 6,
      categories: [
        { name: 'Credit Profile', score: 80, change: 8 },
        { name: 'Financial Health', score: 75, change: 5 },
        { name: 'Business Plan', score: 84, change: 12 },
        { name: 'Collateral', score: 67, change: 3 },
        { name: 'Management', score: 82, change: 4 },
        { name: 'Industry Risk', score: 69, change: 2 }
      ]
    }
  ];

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} className="text-green-500" />;
    if (change < 0) return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Assessment History
        </h3>
        <Calendar size={20} className="text-gray-500" />
      </div>

      <div className="space-y-6">
        {history.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="border-l-4 border-blue-500 pl-4 pb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900">
                  {new Date(record.date).toLocaleDateString()}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {record.overallScore}
                </span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(record.change)}
                  <span className={`text-sm font-medium ${getTrendColor(record.change)}`}>
                    {record.change > 0 ? '+' : ''}{record.change}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {record.categories.map((category) => (
                <div key={category.name} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">{category.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {category.score}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(category.change)}
                      <span className={`text-xs ${getTrendColor(category.change)}`}>
                        {category.change > 0 ? '+' : ''}{category.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
