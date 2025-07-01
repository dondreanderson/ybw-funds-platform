'use client';

import React, { useState } from 'react';
import { CheckCircle, Circle, AlertCircle, Info } from 'lucide-react';
import { FundabilityCriteria, CategoryScore, FUNDABILITY_CATEGORIES } from '@/types/fundability';

interface CriteriaChecklistProps {
  criteria: FundabilityCriteria[];
  completedCriteria: string[];
  onCriteriaUpdate: (criteriaId: string, completed: boolean) => void;
  categoryScores: CategoryScore[];
}

export function CriteriaChecklist({
  criteria,
  completedCriteria,
  onCriteriaUpdate,
  categoryScores
}: CriteriaChecklistProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCriteria = criteria.filter(criterion => {
    const matchesCategory = selectedCategory === 'all' || criterion.category === selectedCategory;
    const matchesSearch = criterion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criterion.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedCriteria = FUNDABILITY_CATEGORIES.reduce((acc, category) => {
    acc[category] = filteredCriteria.filter(c => c.category === category);
    return acc;
  }, {} as Record);

  const getCategoryScore = (category: string) => {
    return categoryScores.find(cs => cs.category === category);
  };

  return (
    
      {/* Filters */}
      
        
           setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        
         setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          All Categories
          {FUNDABILITY_CATEGORIES.map(category => (
            {category}
          ))}
        
      

      {/* Criteria by Category */}
      {Object.entries(groupedCriteria).map(([category, categoryCriteria]) => {
        if (categoryCriteria.length === 0) return null;
        
        const categoryScore = getCategoryScore(category);
        
        return (
          
            
              {category}
              {categoryScore && (
                
                  
                    {categoryScore.criteriaMet}/{categoryScore.totalCriteria} completed
                  
                  
                    = 80 ? 'bg-green-500' :
                        categoryScore.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${categoryScore.percentage}%` }}
                    >
                  
                  
                    {Math.round(categoryScore.percentage)}%
                  
                
              )}
            
            
            
              {categoryCriteria.map(criterion => {
                const isCompleted = completedCriteria.includes(criterion.id);
                
                return (
                   onCriteriaUpdate(criterion.id, !isCompleted)}
                  >
                    
                      
                        {isCompleted ? (
                          
                        ) : (
                          
                        )}
                      
                      
                      
                        
                          
                            {criterion.name}
                            {criterion.required && (
                              
                                Required
                              
                            )}
                          
                          
                            Weight: {criterion.weight}
                          
                        
                        
                        
                          {criterion.description}
                        
                      
                    
                  
                );
              })}
            
          
        );
      })}
    
  );
}