'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FundabilityCriteria, FundabilityScore, FundabilityRecommendation } from '@/types/fundability';
import { FundabilityEngine } from '@/lib/fundability-engine';
import { CriteriaForm } from './CriteriaForm';
import { ScoreDisplay } from './ScoreDisplay';
import { RecommendationsPanel } from './RecommendationsPanel';

const fundabilitySchema = z.object({
  businessStructure: z.object({
    hasEIN: z.boolean(),
    businessType: z.enum(['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship']),
    stateOfIncorporation: z.string(),
    yearsInBusiness: z.number().min(0),
    hasBusinessLicense: z.boolean(),
  }),
  contactInfo: z.object({
    hasBusinessAddress: z.boolean(),
    hasDedicatedBusinessPhone: z.boolean(),
    hasBusinessEmail: z.boolean(),
    hasBusinessWebsite: z.boolean(),
    has411Listing: z.boolean(),
  }),
  banking: z.object({
    hasBusinessBankAccount: z.boolean(),
    separatesPersonalBusiness: z.boolean(),
    hasPositiveBalance: z.boolean(),
    hasBusinessCreditCard: z.boolean(),
    accountAgeMonths: z.number().min(0),
  }),
  credit: z.object({
    hasBusinessCreditProfile: z.boolean(),
    personalCreditScore: z.number().min(300).max(850),
    hasTradeLines: z.boolean(),
    numberOfTradeLines: z.number().min(0),
    hasPublicRecords: z.boolean(),
  }),
  legal: z.object({
    hasBusinessInsurance: z.boolean(),
    hasProperDocumentation: z.boolean(),
    hasOperatingAgreement: z.boolean(),
    compliantWithRegulations: z.boolean(),
    hasIntellectualProperty: z.boolean(),
  }),
  financial: z.object({
    annualRevenue: z.number().min(0),
    profitMargin: z.number(),
    hasFinancialStatements: z.boolean(),
    hasAccountant: z.boolean(),
    cashFlowPositive: z.boolean(),
  }),
  digital: z.object({
    hasGoogleMyBusiness: z.boolean(),
    hasSocialMediaPresence: z.boolean(),
    hasOnlineReviews: z.boolean(),
    averageReviewRating: z.number().min(0).max(5),
    hasSeoPractices: z.boolean(),
  }),
  industry: z.object({
    industryType: z.string(),
    marketStability: z.enum(['High', 'Medium', 'Low']),
    competitivePosition: z.enum(['Strong', 'Average', 'Weak']),
    hasIndustryExperience: z.boolean(),
    regulatoryCompliance: z.boolean(),
  }),
});

export function FundabilityCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [savedAssessments, setSavedAssessments] = useState([]);

  const form = useForm({
    resolver: zodResolver(fundabilitySchema),
    defaultValues: {
      businessStructure: {
        hasEIN: false,
        businessType: 'LLC',
        stateOfIncorporation: '',
        yearsInBusiness: 0,
        hasBusinessLicense: false,
      },
      contactInfo: {
        hasBusinessAddress: false,
        hasDedicatedBusinessPhone: false,
        hasBusinessEmail: false,
        hasBusinessWebsite: false,
        has411Listing: false,
      },
      banking: {
        hasBusinessBankAccount: false,
        separatesPersonalBusiness: false,
        hasPositiveBalance: false,
        hasBusinessCreditCard: false,
        accountAgeMonths: 0,
      },
      credit: {
        hasBusinessCreditProfile: false,
        personalCreditScore: 650,
        hasTradeLines: false,
        numberOfTradeLines: 0,
        hasPublicRecords: false,
      },
      legal: {
        hasBusinessInsurance: false,
        hasProperDocumentation: false,
        hasOperatingAgreement: false,
        compliantWithRegulations: false,
        hasIntellectualProperty: false,
      },
      financial: {
        annualRevenue: 0,
        profitMargin: 0,
        hasFinancialStatements: false,
        hasAccountant: false,
        cashFlowPositive: false,
      },
      digital: {
        hasGoogleMyBusiness: false,
        hasSocialMediaPresence: false,
        hasOnlineReviews: false,
        averageReviewRating: 0,
        hasSeoPractices: false,
      },
      industry: {
        industryType: '',
        marketStability: 'Medium',
        competitivePosition: 'Average',
        hasIndustryExperience: false,
        regulatoryCompliance: false,
      },
    },
  });

  const calculateFundability = async (data: FundabilityCriteria) => {
    setIsCalculating(true);
    
    try {
      // Calculate score using the engine
      const calculatedScore = FundabilityEngine.calculateScore(data);
      const generatedRecommendations = FundabilityEngine.generateRecommendations(data, calculatedScore);
      
      setScore(calculatedScore);
      setRecommendations(generatedRecommendations);
      
      // Save to database
      await saveAssessment(data, calculatedScore, generatedRecommendations);
      
    } catch (error) {
      console.error('Error calculating fundability:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const saveAssessment = async (
    criteria: FundabilityCriteria,
    score: FundabilityScore,
    recommendations: FundabilityRecommendation[]
  ) => {
    try {
      const response = await fetch('/api/fundability/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criteria,
          score,
          recommendations,
          businessName: 'Current Assessment', // You can get this from a form field
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      const result = await response.json();
      console.log('Assessment saved:', result);
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const steps = [
    'Business Foundation',
    'Contact Information',
    'Banking & Financial',
    'Credit Profile',
    'Legal & Compliance',
    'Financial Performance',
    'Digital Presence',
    'Industry & Market'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = form.handleSubmit(calculateFundability);

  return (
    
      
        {/* Header */}
        
          
            Fundability Assessment Calculator
          
          
            Comprehensive 125+ criteria evaluation for business funding readiness
          
        

        {/* Progress Bar */}
        
          
            
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            
            
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            
          
        

        {/* Form Content */}
        
          {!score ? (
            
              
            
          ) : (
            
              
              
            
          )}
        

        {/* Footer */}
        {!score && (
          
            
              Previous
            
            
            {currentStep === steps.length - 1 ? (
              
                {isCalculating ? (
                  <>
                    
                      
                      
                    
                    Calculating...
                  
                ) : (
                  'Calculate Fundability Score'
                )}
              
            ) : (
              
                Next
              
            )}
          
        )}
      
    
  );
}