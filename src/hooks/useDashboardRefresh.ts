'use client';

import { useState } from 'react';
import { UserService, AssessmentEngine } from '@/lib/services';

export function useDashboardRefresh() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateDashboardWithNewAssessment = async (assessmentData: {
    score: number;
    categoryScores: Record<string, number>;
    responses: Record<string, any>;
  }) => {
    try {
      setIsUpdating(true);

      // Get current user
      const { data: userProfile } = await UserService.getCurrentUserProfile();
      
      if (userProfile) {
        // Update user's fundability score
        await UserService.updateFundabilityScore(userProfile.id, assessmentData.score);
        
        // Increment assessment count
        await UserService.incrementAssessmentCount(userProfile.id);

        // Could also save the detailed assessment using AssessmentEngine
        // This would create a proper database record
        
        console.log('Dashboard updated successfully with new assessment data');
      }

      setIsUpdating(false);
      return true;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      setIsUpdating(false);
      return false;
    }
  };

  const triggerDashboardRefresh = () => {
    // Trigger a custom event that the dashboard can listen to
    window.dispatchEvent(new CustomEvent('dashboardRefresh'));
  };

  return {
    updateDashboardWithNewAssessment,
    triggerDashboardRefresh,
    isUpdating
  };
}
