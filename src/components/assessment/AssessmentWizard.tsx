'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ProgressIndicator } from './ProgressIndicator';
import { BusinessFoundation } from './steps/BusinessFoundation';
import { FinancialHealth } from './steps/FinancialHealth';
import { BankingRelationships } from './steps/BankingRelationships';
import { DigitalPresence } from './steps/DigitalPresence';
import { IndustryOperations } from './steps/IndustryOperations';
import { ReviewSubmit } from './steps/ReviewSubmit';
import { AssessmentData, AssessmentStep } from '@/types/assessment';
import { calculatePreviewScore } from '@/lib/assessment/logic';

const STEPS: AssessmentStep[] = [
  { id: 1, title: 'Business Foundation', description: 'Basic business information' },
  { id: 2, title: 'Financial Health', description: 'Revenue and financial status' },
  { id: 3, title: 'Banking Relationships', description: 'Banking and credit information' },
  { id: 4, title: 'Digital Presence', description: 'Online presence and marketing' },
  { id: 5, title: 'Industry & Operations', description: 'Industry and operational details' },
  { id: 6, title: 'Review & Submit', description: 'Review and submit assessment' }
];

const STORAGE_KEY = 'ybw-assessment-progress';

export function AssessmentWizard() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    businessFoundation: {},
    financialHealth: {},
    bankingRelationships: {},
    digitalPresence: {},
    industryOperations: {},
    metadata: {
      startedAt: new Date().toISOString(),
      lastSavedAt: null,
      completedSteps: []
    }
  });
  const [previewScore, setPreviewScore] = useState(0);

  // Load saved progress on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAssessmentData(parsed);
        setCurrentStep(parsed.metadata.completedSteps.length + 1);
        toast.success('Previous progress restored!');
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (assessmentData.metadata.lastSavedAt !== null) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [assessmentData]);

  // Calculate preview score when data changes
  useEffect(() => {
    const score = calculatePreviewScore(assessmentData);
    setPreviewScore(score);
  }, [assessmentData]);

  const saveProgress = () => {
    const updatedData = {
      ...assessmentData,
      metadata: {
        ...assessmentData.metadata,
        lastSavedAt: new Date().toISOString()
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    setAssessmentData(updatedData);
  };

  const updateStepData = (stepKey: keyof AssessmentData, data: any) => {
    const updatedData = {
      ...assessmentData,
      [stepKey]: { ...assessmentData[stepKey], ...data }
    };
    setAssessmentData(updatedData);
    saveProgress();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      // Mark current step as completed
      const completedSteps = [...assessmentData.metadata.completedSteps];
      if (!completedSteps.includes(currentStep)) {
        completedSteps.push(currentStep);
      }
      
      setAssessmentData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          completedSteps
        }
      }));
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Allow going to any completed step or the next step
    if (stepNumber <= assessmentData.metadata.completedSteps.length + 1) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        throw new Error('Assessment submission failed');
      }

      const result = await response.json();
      
      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);
      
      toast.success('Assessment completed successfully!');
      router.push(`/assessment/results/${result.id}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessFoundation
            data={assessmentData.businessFoundation}
            onUpdate={(data) => updateStepData('businessFoundation', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={true}
          />
        );
      case 2:
        return (
          <FinancialHealth
            data={assessmentData.financialHealth}
            onUpdate={(data) => updateStepData('financialHealth', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <BankingRelationships
            data={assessmentData.bankingRelationships}
            onUpdate={(data) => updateStepData('bankingRelationships', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <DigitalPresence
            data={assessmentData.digitalPresence}
            onUpdate={(data) => updateStepData('digitalPresence', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <IndustryOperations
            data={assessmentData.industryOperations}
            onUpdate={(data) => updateStepData('industryOperations', data)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <ReviewSubmit
            data={assessmentData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isLoading={isLoading}
            isLast={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Fundability Assessment
          </h1>
          <p className="text-gray-600">
            Complete your assessment to discover your funding potential
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={assessmentData.metadata.completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Preview Score */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Score Preview
                </h3>
                <p className="text-gray-600 text-sm">
                  Updates as you complete each step
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {previewScore}/100
                </div>
                <div className="text-sm text-gray-500">
                  {previewScore >= 80 ? 'Excellent' : 
                   previewScore >= 60 ? 'Good' : 
                   previewScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Auto-save indicator */}
        {assessmentData.metadata.lastSavedAt && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              ✅ Progress saved automatically at{' '}
              {new Date(assessmentData.metadata.lastSavedAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
