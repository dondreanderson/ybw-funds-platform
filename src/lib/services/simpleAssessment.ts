import { AssessmentEngine, type AssessmentResult } from './assessmentEngine';
import { UserService } from './userService';
import type { AssessmentResponse, APIResponse } from '@/lib/types/core';

export interface SimpleAssessmentData {
  creditScore: number;
  annualRevenue: number;
  timeInBusiness: number;
  businessStructure: string;
  hasBusinessPlan: boolean;
  hasCollateral: boolean;
  hasBusinessBankAccount: boolean;
  hasBusinessWebsite: boolean;
  hasBusinessLicense: boolean;
  hasEIN: boolean;
}

export class SimpleAssessmentService {
  // Convert simple assessment data to assessment responses
  static convertToAssessmentResponses(data: SimpleAssessmentData): AssessmentResponse[] {
    const responses: AssessmentResponse[] = [
      // Business Foundation
      {
        category: 'Business Foundation',
        criterionId: 'has_ein',
        criterionName: 'Has EIN',
        responseValue: data.hasEIN,
        responseType: 'boolean',
        pointsEarned: data.hasEIN ? 100 : 0,
        pointsPossible: 100,
        weightFactor: 1.2,
        isCritical: true
      },
      {
        category: 'Business Foundation',
        criterionId: 'has_business_license',
        criterionName: 'Has Business License',
        responseValue: data.hasBusinessLicense,
        responseType: 'boolean',
        pointsEarned: data.hasBusinessLicense ? 100 : 0,
        pointsPossible: 100,
        weightFactor: 1.0,
        isCritical: true
      },
      
      // Legal Structure
      {
        category: 'Legal Structure',
        criterionId: 'business_structure',
        criterionName: 'Business Structure',
        responseValue: data.businessStructure,
        responseType: 'select',
        pointsEarned: this.calculateStructureScore(data.businessStructure),
        pointsPossible: 100,
        weightFactor: 1.0,
        isCritical: false
      },
      
      // Banking & Finance
      {
        category: 'Banking & Finance',
        criterionId: 'has_business_bank',
        criterionName: 'Has Business Bank Account',
        responseValue: data.hasBusinessBankAccount,
        responseType: 'boolean',
        pointsEarned: data.hasBusinessBankAccount ? 100 : 0,
        pointsPossible: 100,
        weightFactor: 1.3,
        isCritical: true
      },
      {
        category: 'Banking & Finance',
        criterionId: 'annual_revenue',
        criterionName: 'Annual Revenue',
        responseValue: data.annualRevenue,
        responseType: 'number',
        pointsEarned: this.calculateRevenueScore(data.annualRevenue),
        pointsPossible: 100,
        weightFactor: 1.2,
        isCritical: false
      },
      
      // Business Credit Profile
      {
        category: 'Business Credit Profile',
        criterionId: 'credit_score',
        criterionName: 'Credit Score',
        responseValue: data.creditScore,
        responseType: 'number',
        pointsEarned: this.calculateCreditScore(data.creditScore),
        pointsPossible: 100,
        weightFactor: 1.4,
        isCritical: true
      },
      
      // Marketing Presence
      {
        category: 'Marketing Presence',
        criterionId: 'has_website',
        criterionName: 'Has Business Website',
        responseValue: data.hasBusinessWebsite,
        responseType: 'boolean',
        pointsEarned: data.hasBusinessWebsite ? 100 : 0,
        pointsPossible: 100,
        weightFactor: 1.0,
        isCritical: false
      },
      
      // Operational Excellence
      {
        category: 'Operational Excellence',
        criterionId: 'time_in_business',
        criterionName: 'Time in Business',
        responseValue: data.timeInBusiness,
        responseType: 'number',
        pointsEarned: this.calculateTimeInBusinessScore(data.timeInBusiness),
        pointsPossible: 100,
        weightFactor: 1.0,
        isCritical: false
      },
      
      // Documentation
      {
        category: 'Documentation',
        criterionId: 'has_business_plan',
        criterionName: 'Has Business Plan',
        responseValue: data.hasBusinessPlan,
        responseType: 'boolean',
        pointsEarned: data.hasBusinessPlan ? 100 : 0,
        pointsPossible: 100,
        weightFactor: 1.1,
        isCritical: false
      },
      
      // Financial Health
      {
        category: 'Financial Health',
        criterionId: 'has_collateral',
        criterionName: 'Has Collateral',
        responseValue: data.hasCollateral,
        responseType: 'boolean',
        pointsEarned: data.hasCollateral ? 100 : 0,
        pointsPossible: 100,
        weightFactor: 1.2,
        isCritical: false
      }
    ];

    return responses;
  }

  // Process simple assessment
  static async processSimpleAssessment(
    userId: string,
    assessmentData: SimpleAssessmentData
  ): Promise<APIResponse<AssessmentResult & { assessmentId?: string }>> {
    try {
      // Convert to assessment responses
      const responses = this.convertToAssessmentResponses(assessmentData);
      
      // Calculate scores
      const assessmentResult = AssessmentEngine.calculateAssessmentScore(responses);
      
      // Save assessment
      const { data: assessment, error } = await AssessmentEngine.saveAssessment(userId, assessmentResult);
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Update user's fundability score
      await UserService.updateFundabilityScore(userId, assessmentResult.overallScore);
      await UserService.incrementAssessmentCount(userId);

      return {
        success: true,
        data: {
          ...assessmentResult,
          assessmentId: assessment?.id
        },
        message: 'Assessment completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Scoring helper methods
  private static calculateStructureScore(structure: string): number {
    const scores: Record<string, number> = {
      'Corporation': 100,
      'LLC': 80,
      'Partnership': 60,
      'Sole Proprietorship': 40
    };
    return scores[structure] || 0;
  }

  private static calculateCreditScore(creditScore: number): number {
    if (creditScore >= 750) return 100;
    if (creditScore >= 700) return 85;
    if (creditScore >= 650) return 70;
    if (creditScore >= 600) return 55;
    if (creditScore >= 550) return 40;
    return 25;
  }

  private static calculateRevenueScore(revenue: number): number {
    if (revenue >= 1000000) return 100;
    if (revenue >= 500000) return 85;
    if (revenue >= 250000) return 70;
    if (revenue >= 100000) return 55;
    if (revenue >= 50000) return 40;
    return 25;
  }

  private static calculateTimeInBusinessScore(years: number): number {
    if (years >= 5) return 100;
    if (years >= 3) return 80;
    if (years >= 2) return 60;
    if (years >= 1) return 40;
    return 20;
  }
}
