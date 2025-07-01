'use client';

import React from 'react';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { CategoryScore } from '@/types/fundability';

interface FundabilityScoreCardProps {
  score: number;
  totalCriteria: number;
  completedCriteria: number;
  categoryScores: CategoryScore[];
}

export function FundabilityScoreCard({
  score,
  totalCriteria,
  completedCriteria,
  categoryScores
}: FundabilityScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRating = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <>
      {/* Main Score Card */}
      
        
          
            
              {Math.round(score)}
            
          
          Fundability Score
          
            {getRating(score)}
          
          
            
              
              {completedCriteria} of {totalCriteria} criteria met
            
            
              
            
          
        
      

      {/* Category Breakdown */}
      
        Category Breakdown
        
          {categoryScores.map((category) => (
            
              
                
                  {category.category}
                
                
                  
                    = 80 ? 'bg-green-500' :
                        category.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${category.percentage}%` }}
                    >
                  
                
                
                  {Math.round(category.percentage)}%
                
              
            
          ))}
        
      
    
  );
}