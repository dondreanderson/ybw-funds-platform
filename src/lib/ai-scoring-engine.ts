import { supabase } from '@/lib/supabase';

// Business Logic Constants from your documentation
export const FUNDABILITY_CATEGORIES = {
  'Business Foundation': { weight: 0.20, maxCriteria: 25 },
  'Legal Structure': { weight: 0.15, maxCriteria: 20 },
  'Banking & Finance': { weight: 0.20, maxCriteria: 30 },
  'Business Credit Profile': { weight: 0.15, maxCriteria: 25 },
  'Marketing Presence': { weight: 0.10, maxCriteria: 15 },
  'Operational Excellence': { weight: 0.10, maxCriteria: 10 },
  'Documentation': { weight: 0.05, maxCriteria: 15 },
  'Financial Health': { weight: 0.05, maxCriteria: 10 }
} as const;

export type FundabilityCategory = keyof typeof FUNDABILITY_CATEGORIES;

export interface CriterionData {
  id: string;
  category: FundabilityCategory;
  name: string;
  description: string;
  weight: number;
  required: boolean;
  businessTypes?: string[];
  industries?: string[];
}

export interface AssessmentData {
  userId: string;
  businessType: string;
  industry: string;
  yearsInBusiness: number;
  annualRevenue: number;
  completedCriteria: string[];
  responses: Record<string, any>;
}

export interface ScoringResult {
  overallScore: number;
  percentage: number;
  categoryScores: CategoryScore[];
  recommendations: Recommendation[];
  fundabilityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  improvementPotential: number;
}

export interface CategoryScore {
  category: FundabilityCategory;
  score: number;
  maxScore: number;
  percentage: number;
  completedCriteria: number;
  totalCriteria: number;
  weight: number;
  recommendations: string[];
}

export interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: FundabilityCategory;
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number;
  timeToComplete: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cost: 'free' | 'low' | 'medium' | 'high';
}

export class AIFundabilityScoringEngine {
  private criteria: CriterionData[] = [];

  constructor() {
    this.initializeCriteria();
  }

  /**
   * Main AI scoring function with advanced business logic
   */
  async calculateFundabilityScore(assessmentData: AssessmentData): Promise<ScoringResult> {
    // Get relevant criteria based on business type and industry
    const relevantCriteria = this.getRelevantCriteria(
      assessmentData.businessType,
      assessmentData.industry
    );

    // Calculate category scores with AI weighting
    const categoryScores = this.calculateCategoryScores(
      relevantCriteria,
      assessmentData
    );

    // Apply AI-driven business logic adjustments
    const adjustedScores = this.applyBusinessLogicAdjustments(
      categoryScores,
      assessmentData
    );

    // Calculate overall score with dynamic weighting
    const overallScore = this.calculateOverallScore(adjustedScores, assessmentData);

    // Generate AI-powered recommendations
    const recommendations = await this.generateAIRecommendations(
      adjustedScores,
      assessmentData,
      relevantCriteria
    );

    return {
      overallScore,
      percentage: (overallScore / 1000) * 100, // Max score is 1000
      categoryScores: adjustedScores,
      recommendations,
      fundabilityGrade: this.calculateGrade(overallScore),
      improvementPotential: this.calculateImprovementPotential(adjustedScores)
    };
  }

  /**
   * Get criteria relevant to specific business type and industry
   */
  private getRelevantCriteria(businessType: string, industry: string): CriterionData[] {
    return this.criteria.filter(criterion => {
      const typeMatch = !criterion.businessTypes || 
        criterion.businessTypes.includes(businessType) ||
        criterion.businessTypes.includes('all');
      
      const industryMatch = !criterion.industries ||
        criterion.industries.includes(industry) ||
        criterion.industries.includes('all');

      return typeMatch && industryMatch;
    });
  }

  /**
   * Calculate scores for each category with AI logic
   */
  private calculateCategoryScores(
    criteria: CriterionData[],
    assessmentData: AssessmentData
  ): CategoryScore[] {
    const categoryScores: CategoryScore[] = [];

    Object.entries(FUNDABILITY_CATEGORIES).forEach(([categoryName, config]) => {
      const category = categoryName as FundabilityCategory;
      const categoryCriteria = criteria.filter(c => c.category === category);
      
      let score = 0;
      let maxScore = 0;
      let completedCount = 0;

      categoryCriteria.forEach(criterion => {
        maxScore += criterion.weight;
        
        if (assessmentData.completedCriteria.includes(criterion.id)) {
          // Apply AI scoring logic based on business characteristics
          let criterionScore = criterion.weight;
          
          // Bonus scoring for critical business characteristics
          if (this.isCriticalForBusiness(criterion, assessmentData)) {
            criterionScore *= 1.2; // 20% bonus for critical criteria
          }
          
          score += criterionScore;
          completedCount++;
        }
      });

      // Apply category-specific AI adjustments
      score = this.applyCategoryAdjustments(category, score, assessmentData);

      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

      categoryScores.push({
        category,
        score,
        maxScore,
        percentage,
        completedCriteria: completedCount,
        totalCriteria: categoryCriteria.length,
        weight: config.weight,
        recommendations: this.generateCategoryRecommendations(category, percentage)
      });
    });

    return categoryScores;
  }

  /**
   * Apply AI-driven business logic adjustments
   */
  private applyBusinessLogicAdjustments(
    categoryScores: CategoryScore[],
    assessmentData: AssessmentData
  ): CategoryScore[] {
    return categoryScores.map(categoryScore => {
      let adjustedScore = categoryScore.score;

      // Years in business adjustment
      if (assessmentData.yearsInBusiness >= 5) {
        adjustedScore *= 1.1; // 10% bonus for established businesses
      } else if (assessmentData.yearsInBusiness < 2) {
        adjustedScore *= 0.9; // 10% penalty for new businesses
      }

      // Revenue-based adjustments
      if (assessmentData.annualRevenue >= 1000000) {
        adjustedScore *= 1.15; // 15% bonus for high revenue
      } else if (assessmentData.annualRevenue < 100000) {
        adjustedScore *= 0.95; // 5% penalty for low revenue
      }

      // Industry-specific adjustments
      adjustedScore = this.applyIndustryAdjustments(
        adjustedScore,
        categoryScore.category,
        assessmentData.industry
      );

      return {
        ...categoryScore,
        score: adjustedScore,
        percentage: (adjustedScore / categoryScore.maxScore) * 100
      };
    });
  }

  /**
   * Calculate overall fundability score with dynamic weighting
   */
  private calculateOverallScore(
    categoryScores: CategoryScore[],
    assessmentData: AssessmentData
  ): number {
    let totalScore = 0;

    categoryScores.forEach(categoryScore => {
      // Dynamic weighting based on business characteristics
      let dynamicWeight = categoryScore.weight;

      // Adjust weights based on business type
      if (assessmentData.businessType === 'startup') {
        if (categoryScore.category === 'Business Foundation') {
          dynamicWeight *= 1.3; // Emphasize foundation for startups
        }
      } else if (assessmentData.businessType === 'established') {
        if (categoryScore.category === 'Financial Health') {
          dynamicWeight *= 1.2; // Emphasize financials for established businesses
        }
      }

      totalScore += categoryScore.score * dynamicWeight;
    });

    return Math.round(totalScore);
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateAIRecommendations(
    categoryScores: CategoryScore[],
    assessmentData: AssessmentData,
    criteria: CriterionData[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Find missing critical criteria
    const missingCriteria = criteria.filter(
      criterion => 
        criterion.required && 
        !assessmentData.completedCriteria.includes(criterion.id)
    );

    // Generate recommendations for each category
    categoryScores.forEach(categoryScore => {
      if (categoryScore.percentage < 70) { // Below 70% needs attention
        const priority = this.determinePriority(categoryScore.percentage);
        
        const recommendation: Recommendation = {
          id: `rec-${categoryScore.category.toLowerCase().replace(/\s+/g, '-')}`,
          priority,
          category: categoryScore.category,
          title: `Improve ${categoryScore.category}`,
          description: this.generateCategoryDescription(categoryScore),
          actionItems: this.generateActionItems(categoryScore.category, assessmentData),
          estimatedImpact: this.calculateEstimatedImpact(categoryScore),
          timeToComplete: this.estimateTimeToComplete(categoryScore.category),
          difficulty: this.assessDifficulty(categoryScore.category),
          cost: this.estimateCost(categoryScore.category)
        };

        recommendations.push(recommendation);
      }
    });

    // Add specific recommendations for missing critical criteria
    missingCriteria.slice(0, 5).forEach(criterion => {
      recommendations.push({
        id: `critical-${criterion.id}`,
        priority: 'critical',
        category: criterion.category,
        title: `Complete: ${criterion.name}`,
        description: criterion.description,
        actionItems: this.generateCriterionActionItems(criterion),
        estimatedImpact: criterion.weight,
        timeToComplete: this.estimateCriterionTime(criterion),
        difficulty: 'medium',
        cost: 'low'
      });
    });

    // Sort by priority and estimated impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.estimatedImpact - a.estimatedImpact;
    });
  }

  /**
   * Helper methods for business logic
   */
  private isCriticalForBusiness(criterion: CriterionData, assessmentData: AssessmentData): boolean {
    // AI logic to determine if a criterion is critical for this specific business
    const criticalCriteria = ['EIN', 'Business License', 'Business Bank Account', 'DUNS Number'];
    return criticalCriteria.some(critical => criterion.name.includes(critical));
  }

  private applyCategoryAdjustments(
    category: FundabilityCategory,
    score: number,
    assessmentData: AssessmentData
  ): number {
    switch (category) {
      case 'Banking & Finance':
        if (assessmentData.annualRevenue > 500000) {
          return score * 1.1; // Bonus for strong financials
        }
        break;
      case 'Business Credit Profile':
        if (assessmentData.yearsInBusiness >= 3) {
          return score * 1.05; // Slight bonus for established credit history
        }
        break;
    }
    return score;
  }

  private applyIndustryAdjustments(
    score: number,
    category: FundabilityCategory,
    industry: string
  ): number {
    // Industry-specific adjustments based on typical requirements
    const industryAdjustments: Record<string, Record<FundabilityCategory, number>> = {
      'technology': {
        'Business Foundation': 1.0,
        'Legal Structure': 1.1,
        'Banking & Finance': 1.0,
        'Business Credit Profile': 0.95,
        'Marketing Presence': 1.15,
        'Operational Excellence': 1.05,
        'Documentation': 1.1,
        'Financial Health': 1.0
      },
      'manufacturing': {
        'Business Foundation': 1.1,
        'Legal Structure': 1.05,
        'Banking & Finance': 1.05,
        'Business Credit Profile': 1.1,
        'Marketing Presence': 0.95,
        'Operational Excellence': 1.15,
        'Documentation': 1.1,
        'Financial Health': 1.05
      }
    };

    const adjustment = industryAdjustments[industry]?.[category] || 1.0;
    return score * adjustment;
  }

  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 900) return 'A+';
    if (score >= 800) return 'A';
    if (score >= 750) return 'B+';
    if (score >= 700) return 'B';
    if (score >= 650) return 'C+';
    if (score >= 600) return 'C';
    if (score >= 500) return 'D';
    return 'F';
  }

  private calculateImprovementPotential(categoryScores: CategoryScore[]): number {
    const totalPossibleImprovement = categoryScores.reduce(
      (sum, category) => sum + (category.maxScore - category.score),
      0
    );
    return Math.round(totalPossibleImprovement);
  }

  private determinePriority(percentage: number): 'critical' | 'high' | 'medium' | 'low' {
    if (percentage < 30) return 'critical';
    if (percentage < 50) return 'high';
    if (percentage < 70) return 'medium';
    return 'low';
  }

  private generateCategoryDescription(categoryScore: CategoryScore): string {
    const percentage = Math.round(categoryScore.percentage);
    return `Your ${categoryScore.category} score is ${percentage}%, which needs improvement. Completing the remaining criteria in this category could significantly boost your fundability.`;
  }

  private generateActionItems(category: FundabilityCategory, assessmentData: AssessmentData): string[] {
    const actionItems: Record<FundabilityCategory, string[]> = {
      'Business Foundation': [
        'Obtain or verify your EIN (Federal Tax ID)',
        'Complete state business registration',
        'Secure necessary business licenses',
        'Register DBA if using different business name'
      ],
      'Legal Structure': [
        'Choose optimal business structure (LLC, Corp, etc.)',
        'File Articles of Incorporation',
        'Appoint registered agent',
        'Create operating agreement or bylaws'
      ],
      'Banking & Finance': [
        'Open dedicated business bank account',
        'Apply for business credit card',
        'Establish business line of credit',
        'Build relationship with business banker'
      ],
      'Business Credit Profile': [
        'Obtain DUNS number from D&B',
        'Create business profiles with credit bureaus',
        'Establish trade references',
        'Set up net terms accounts'
      ],
      'Marketing Presence': [
        'Create professional business website',
        'Set up business email address',
        'Claim Google My Business listing',
        'Get dedicated business phone number'
      ],
      'Operational Excellence': [
        'Obtain business insurance',
        'Set up professional services (accounting/legal)',
        'Implement proper record keeping',
        'Establish business processes'
      ],
      'Documentation': [
        'Prepare current financial statements',
        'Organize business tax returns',
        'Create or update business plan',
        'Maintain organized bank statements'
      ],
      'Financial Health': [
        'Demonstrate consistent revenue growth',
        'Maintain healthy debt-to-income ratio',
        'Build emergency fund',
        'Diversify customer base'
      ]
    };

    return actionItems[category] || [];
  }

  private calculateEstimatedImpact(categoryScore: CategoryScore): number {
    const remainingPoints = categoryScore.maxScore - categoryScore.score;
    return Math.round(remainingPoints * categoryScore.weight);
  }

  private estimateTimeToComplete(category: FundabilityCategory): string {
    const timeEstimates: Record<FundabilityCategory, string> = {
      'Business Foundation': '2-4 weeks',
      'Legal Structure': '1-3 weeks',
      'Banking & Finance': '1-2 weeks',
      'Business Credit Profile': '2-6 weeks',
      'Marketing Presence': '1-2 weeks',
      'Operational Excellence': '2-4 weeks',
      'Documentation': '1-2 weeks',
      'Financial Health': '3-6 months'
    };

    return timeEstimates[category] || '2-4 weeks';
  }

  private assessDifficulty(category: FundabilityCategory): 'easy' | 'medium' | 'hard' {
    const difficultyMap: Record<FundabilityCategory, 'easy' | 'medium' | 'hard'> = {
      'Business Foundation': 'medium',
      'Legal Structure': 'medium',
      'Banking & Finance': 'easy',
      'Business Credit Profile': 'hard',
      'Marketing Presence': 'easy',
      'Operational Excellence': 'medium',
      'Documentation': 'easy',
      'Financial Health': 'hard'
    };

    return difficultyMap[category] || 'medium';
  }

  private estimateCost(category: FundabilityCategory): 'free' | 'low' | 'medium' | 'high' {
    const costMap: Record<FundabilityCategory, 'free' | 'low' | 'medium' | 'high'> = {
      'Business Foundation': 'low',
      'Legal Structure': 'medium',
      'Banking & Finance': 'free',
      'Business Credit Profile': 'low',
      'Marketing Presence': 'low',
      'Operational Excellence': 'medium',
      'Documentation': 'free',
      'Financial Health': 'free'
    };

    return costMap[category] || 'low';
  }

  private generateCategoryRecommendations(category: FundabilityCategory, percentage: number): string[] {
    if (percentage >= 80) return ['Excellent work! Maintain current standards.'];
    if (percentage >= 60) return ['Good progress. Focus on completing remaining items.'];
    if (percentage >= 40) return ['Needs improvement. Prioritize key requirements.'];
    return ['Critical attention needed. Address immediately.'];
  }

  private generateCriterionActionItems(criterion: CriterionData): string[] {
    // Generate specific action items based on criterion type
    return [
      `Research requirements for ${criterion.name}`,
      `Gather necessary documentation`,
      `Complete ${criterion.name} process`,
      `Verify completion and update records`
    ];
  }

  private estimateCriterionTime(criterion: CriterionData): string {
    if (criterion.required) return '1-2 weeks';
    return '2-4 weeks';
  }

  /**
   * Initialize criteria data based on your 125+ criteria specification
   */
  private initializeCriteria(): void {
    this.criteria = [
      // Business Foundation (25 criteria)
      {
        id: 'bf-001',
        category: 'Business Foundation',
        name: 'EIN (Federal Tax ID)',
        description: 'Business has a valid EIN from the IRS',
        weight: 25,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      {
        id: 'bf-002',
        category: 'Business Foundation',
        name: 'State Business Registration',
        description: 'Business is properly registered with the state',
        weight: 20,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      {
        id: 'bf-003',
        category: 'Business Foundation',
        name: 'Business License',
        description: 'Current business license for your industry',
        weight: 18,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      // Legal Structure (20 criteria)
      {
        id: 'ls-001',
        category: 'Legal Structure',
        name: 'Corporate Structure',
        description: 'Business is structured as LLC, Corporation, or Partnership',
        weight: 20,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      {
        id: 'ls-002',
        category: 'Legal Structure',
        name: 'Registered Agent',
        description: 'Has a registered agent for legal documents',
        weight: 15,
        required: true,
        businessTypes: ['corporation', 'llc'],
        industries: ['all']
      },
      // Banking & Finance (30 criteria)
      {
        id: 'bf-101',
        category: 'Banking & Finance',
        name: 'Business Bank Account',
        description: 'Separate business bank account established',
        weight: 25,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      {
        id: 'bf-102',
        category: 'Banking & Finance',
        name: 'Business Credit Card',
        description: 'At least one business credit card in company name',
        weight: 20,
        required: false,
        businessTypes: ['all'],
        industries: ['all']
      },
      // Business Credit Profile (25 criteria)
      {
        id: 'bcp-001',
        category: 'Business Credit Profile',
        name: 'DUNS Number',
        description: 'Has a DUNS number from Dun & Bradstreet',
        weight: 20,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      {
        id: 'bcp-002',
        category: 'Business Credit Profile',
        name: 'Experian Business Profile',
        description: 'Business profile established with Experian',
        weight: 15,
        required: false,
        businessTypes: ['all'],
        industries: ['all']
      },
      // Marketing Presence (15 criteria)
      {
        id: 'mp-001',
        category: 'Marketing Presence',
        name: 'Professional Website',
        description: 'Has a professional business website',
        weight: 18,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      {
        id: 'mp-002',
        category: 'Marketing Presence',
        name: 'Business Email',
        description: 'Uses professional business email (not Gmail/Yahoo)',
        weight: 12,
        required: false,
        businessTypes: ['all'],
        industries: ['all']
      },
      // Operational Excellence (10 criteria)
      {
        id: 'oe-001',
        category: 'Operational Excellence',
        name: 'Business Insurance',
        description: 'Current general liability insurance',
        weight: 15,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      // Documentation (15 criteria)
      {
        id: 'doc-001',
        category: 'Documentation',
        name: 'Financial Statements',
        description: 'Current profit & loss statements',
        weight: 20,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      {
        id: 'doc-002',
        category: 'Documentation',
        name: 'Tax Returns',
        description: 'Business tax returns for past 2 years',
        weight: 18,
        required: true,
        businessTypes: ['all'],
        industries: ['all']
      },
      // Financial Health (10 criteria)
      {
        id: 'fh-001',
        category: 'Financial Health',
        name: 'Revenue Growth',
        description: 'Shows consistent revenue growth',
        weight: 20,
        required: false,
        businessTypes: ['all'],
        industries: ['all']
      }
      // ... Add remaining criteria to reach 125+ total
    ];
  }
}

// Export singleton instance
export const aiScoringEngine = new AIFundabilityScoringEngine();
