import { realAssessmentService } from './realAssessmentService';

export interface SimpleAssessmentData {
  creditScore: number;
  annualRevenue: number;
  timeInBusiness: number;
  businessStructure: string;
  hasBusinessPlan: boolean;
  hasCollateral: boolean;
}

export interface AdvancedAssessmentData {
  responses: Record<string, any>;
  categoryScores: Record<string, number>;
  overallScore: number;
}

export class AssessmentIntegration {
  // Save simple assessment to your database
  static async saveSimpleAssessment(
    userId: string,
    data: SimpleAssessmentData
  ): Promise<string | null> {
    try {
      // Convert simple assessment to your schema format
      const categoryPerformances = [
        {
          categoryId: 'credit_profile',
          categoryName: 'Credit Profile',
          score: Math.min(data.creditScore / 8.5, 100), // Convert 850 scale to 100
          maxScore: 100,
          completedCriteria: 1,
          totalCriteria: 1,
          answers: { creditScore: data.creditScore }
        },
        {
          categoryId: 'financial_health',
          categoryName: 'Financial Health',
          score: Math.min((data.annualRevenue / 1000000) * 100, 100), // Revenue-based score
          maxScore: 100,
          completedCriteria: 1,
          totalCriteria: 1,
          answers: { annualRevenue: data.annualRevenue }
        },
        {
          categoryId: 'business_maturity',
          categoryName: 'Business Maturity',
          score: Math.min((data.timeInBusiness / 10) * 100, 100), // Years-based score
          maxScore: 100,
          completedCriteria: 1,
          totalCriteria: 1,
          answers: { timeInBusiness: data.timeInBusiness }
        }
      ];

      const overallScore = Math.round(
        categoryPerformances.reduce((sum, cat) => sum + cat.score, 0) / categoryPerformances.length
      );

      const categoryScores = categoryPerformances.reduce((acc, cat) => {
        acc[cat.categoryId] = cat.score;
        return acc;
      }, {} as Record<string, number>);

      return await realAssessmentService.saveAssessment(
        userId,
        overallScore,
        categoryScores,
        categoryPerformances
      );
    } catch (error) {
      console.error('Error saving simple assessment:', error);
      return null;
    }
  }

  // Save advanced assessment to your database
  static async saveAdvancedAssessment(
    userId: string,
    data: AdvancedAssessmentData
  ): Promise<string | null> {
    try {
      // Convert advanced assessment responses to category performances
      const categoryPerformances = Object.entries(data.categoryScores).map(([categoryId, score]) => ({
        categoryId,
        categoryName: this.getCategoryName(categoryId),
        score,
        maxScore: 100,
        completedCriteria: this.getCompletedCriteria(categoryId, data.responses),
        totalCriteria: this.getTotalCriteria(categoryId),
        answers: this.getCategoryAnswers(categoryId, data.responses)
      }));

      return await realAssessmentService.saveAssessment(
        userId,
        data.overallScore,
        data.categoryScores,
        categoryPerformances
      );
    } catch (error) {
      console.error('Error saving advanced assessment:', error);
      return null;
    }
  }

  private static getCategoryName(categoryId: string): string {
    const names: Record<string, string> = {
      'business_registration': 'Business Registration',
      'credit_profile': 'Credit Profile',
      'financial_documentation': 'Financial Documentation',
      'operational_infrastructure': 'Operational Infrastructure',
      'online_presence': 'Online Presence',
      'risk_compliance': 'Risk & Compliance'
    };
    return names[categoryId] || categoryId;
  }

  private static getCompletedCriteria(categoryId: string, responses: Record<string, any>): number {
    // Count completed responses for this category
    return Object.keys(responses).filter(key => 
      key.startsWith(categoryId) && responses[key] !== null && responses[key] !== undefined
    ).length;
  }

  private static getTotalCriteria(categoryId: string): number {
    // Default criteria counts per category
    const counts: Record<string, number> = {
      'business_registration': 25,
      'credit_profile': 20,
      'financial_documentation': 20,
      'operational_infrastructure': 15,
      'online_presence': 15,
      'risk_compliance': 25
    };
    return counts[categoryId] || 20;
  }

  private static getCategoryAnswers(categoryId: string, responses: Record<string, any>): any {
    // Filter responses for this category
    const categoryAnswers: Record<string, any> = {};
    Object.entries(responses).forEach(([key, value]) => {
      if (key.startsWith(categoryId)) {
        categoryAnswers[key] = value;
      }
    });
    return categoryAnswers;
  }
}
