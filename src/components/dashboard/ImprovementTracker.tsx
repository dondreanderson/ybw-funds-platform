'use client';

import React, { useState } from 'react';

interface ActionItem {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  completed: boolean;
  dueDate?: string;
}

interface ImprovementTrackerProps {
  categoryScores: Record<string, number>;
  loading?: boolean;
}

export function ImprovementTracker({ categoryScores, loading }: ImprovementTrackerProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>(() => {
    // Generate action items based on category scores
    const items: ActionItem[] = [];
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 70) {
        switch (category) {
          case 'Business Foundation':
            items.push({
              id: 'bf-1',
              title: 'Obtain EIN from IRS',
              category,
              priority: 'high',
              impact: 15,
              completed: false
            });
            items.push({
              id: 'bf-2', 
              title: 'Register business with state',
              category,
              priority: 'high',
              impact: 12,
              completed: false
            });
            break;
          case 'Banking & Finance':
            items.push({
              id: 'bf-3',
              title: 'Open dedicated business bank account',
              category,
              priority: 'high',
              impact: 18,
              completed: false
            });
            items.push({
              id: 'bf-4',
              title: 'Set up business accounting system',
              category,
              priority: 'medium',
              impact: 10,
              completed: false
            });
            break;
          case 'Business Credit Profile':
            items.push({
              id: 'bcp-1',
              title: 'Apply for DUNS number',
              category,
              priority: 'high',
              impact: 20,
              completed: false
            });
            items.push({
              id: 'bcp-2',
              title: 'Establish trade credit accounts',
              category,
              priority: 'medium',
              impact: 15,
              completed: false
            });
            break;
          case 'Marketing Presence':
            items.push({
              id: 'mp-1',
              title: 'Create professional website',
              category,
              priority: 'medium',
              impact: 12,
              completed: false
            });
            items.push({
              id: 'mp-2',
              title: 'Set up Google My Business',
              category,
              priority: 'low',
              impact: 8,
              completed: false
            });
            break;
        }
      }
    });
    
    return items.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  });

  const toggleComplete = (id: string) => {
    setActionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedItems = actionItems.filter(item => item.completed).length;
  const totalImpact = actionItems.reduce((sum, item) => 
    item.completed ? sum + item.impact : sum, 0
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Improvement Actions</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {completedItems} of {actionItems.length} completed
          </p>
          <p className="text-sm font-medium text-green-600">
            +{totalImpact} potential points
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">
            {Math.round((completedItems / actionItems.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completedItems / actionItems.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Action items list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {actionItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center p-3 rounded-lg border transition-all ${
              item.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleComplete(item.id)}
              className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${
                  item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {item.title}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    +{item.impact}pt
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
      
      {actionItems.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-gray-500">Great job! No immediate improvements needed.</p>
          <p className="text-sm text-gray-400 mt-1">Keep maintaining your excellent fundability score!</p>
        </div>
      )}
    </div>
  );
}