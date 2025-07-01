'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Recommendation, CategoryScore } from '@/types/fundability';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  categoryScores: CategoryScore[];
}

export function RecommendationsPanel({ recommendations, categoryScores }: RecommendationsPanelProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return ;
      case 'medium': return ;
      case 'low': return ;
      default: return ;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
  );

  return (
    
      {/* Priority Summary */}
      
        {['high', 'medium', 'low'].map(priority => {
          const count = recommendations.filter(r => r.priority === priority).length;
          const totalImpact = recommendations
            .filter(r => r.priority === priority)
            .reduce((sum, r) => sum + r.estimatedImpact, 0);
          
          return (
            
              
                
                  {getPriorityIcon(priority)}
                  {priority} Priority
                
                {count}
              
              
                Potential impact: +{totalImpact} points
              
            
          );
        })}
      

      {/* Recommendations List */}
      {sortedRecommendations.length === 0 ? (
        
          
          Excellent Work!
          
            You've completed all major fundability criteria. Keep monitoring your business credit profile.
          
        
      ) : (
        
          {sortedRecommendations.map(recommendation => (
            
              
                
                  {getPriorityIcon(recommendation.priority)}
                  
                    
                      {recommendation.title}
                    
                    
                      {recommendation.category} • {recommendation.timeToComplete}
                    
                  
                
                
                  
                    +{recommendation.estimatedImpact} points
                  
                
              
              
              {recommendation.description}
              
              
                Action Items:
                
                  {recommendation.actionItems.map((item, index) => (
                    
                      
                      {item}
                    
                  ))}
                
              
            
          ))}
        
      )}
    
  );
}