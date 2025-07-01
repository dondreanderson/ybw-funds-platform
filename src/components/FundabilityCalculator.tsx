'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, AlertCircle, TrendingUp, Download } from 'lucide-react';
import { FundabilityScoreCard } from './FundabilityScoreCard';
import { CriteriaChecklist } from './CriteriaChecklist';
import { RecommendationsPanel } from './RecommendationsPanel';
import { 
  FundabilityAssessment, 
  FundabilityCriteria, 
  CategoryScore,
  FUNDABILITY_CATEGORIES 
} from '@/types/fundability';
import { calculateFundabilityScore, generateRecommendations } from '@/utils/fundabilityEngine';

interface FundabilityCalculatorProps {
  userId: string;
  onScoreUpdate?: (score: number) => void;
}

export default function FundabilityCalculator({ userId, onScoreUpdate }: FundabilityCalculatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState>({
    userId,
    completedCriteria: [],
    score: 0,
    maxScore: 0,
    percentage: 0
  });
  const [criteria, setCriteria] = useState([]);
  const [categoryScores, setCategoryScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCriteria();
    loadExistingAssessment();
  }, [userId]);

  const loadCriteria = async () => {
    try {
      const response = await fetch('/api/fundability/criteria');
      const data = await response.json();
      setCriteria(data.criteria);
    } catch (error) {
      console.error('Error loading criteria:', error);
    }
  };

  const loadExistingAssessment = async () => {
    try {
      const response = await fetch(`/api/fundability/assessment/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
        calculateScores(data.assessment.completedCriteria);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (completedCriteria: string[]) => {
    const scores = calculateFundabilityScore(criteria, completedCriteria);
    setCategoryScores(scores.categoryScores);
    
    const newAssessment = {
      ...assessment,
      score: scores.totalScore,
      maxScore: scores.maxScore,
      percentage: scores.percentage,
      completedCriteria,
      recommendations: generateRecommendations(criteria, completedCriteria)
    };
    
    setAssessment(newAssessment);
    onScoreUpdate?.(scores.percentage);
  };

  const handleCriteriaUpdate = async (criteriaId: string, completed: boolean) => {
    const updatedCriteria = completed 
      ? [...(assessment.completedCriteria || []), criteriaId]
      : (assessment.completedCriteria || []).filter(id => id !== criteriaId);

    calculateScores(updatedCriteria);
    await saveAssessment({ ...assessment, completedCriteria: updatedCriteria });
  };

  const saveAssessment = async (assessmentData: Partial) => {
    setSaving(true);
    try {
      await fetch('/api/fundability/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/fundability/report/${userId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fundability-report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      
        
        Loading Fundability Calculator...
      
    );
  }

  return (
    
      {/* Header */}
      
        
          
            
            
              Fundability Calculator
              Assess your business's funding readiness with 125+ criteria
            
          
          
            {saving && (
              
                
                Saving...
              
            )}
            
              
              Export Report
            
          
        
      

      {/* Score Overview */}
      
        
      

      {/* Navigation Tabs */}
      
        
          
            {['Assessment', 'Recommendations', 'Progress'].map((tab, index) => (
               setCurrentStep(index)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentStep === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              
            ))}
          
        

        
          {currentStep === 0 && (
            
          )}
          
          {currentStep === 1 && (
            
          )}
          
          {currentStep === 2 && (
            
              Progress Overview
              {categoryScores.map((category) => (
                
                  
                    {category.category}
                    
                      {category.criteriaMet}/{category.totalCriteria} completed
                    
                    
                    {category.percentage}%
                  
                
              ))}
            
          )}
        
      
    
  );
}