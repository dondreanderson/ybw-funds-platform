//import { ErrorHandler } from './errorHandler';

// Add these interfaces at the top
export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  completedCriteria: number;
  totalCriteria: number;
}

export interface CriterionScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AdvancedScoreResult {
  totalScore: number;
  categoryScores: Record<string, CategoryScore>;
  completionPercentage: number;
  criteriaScores: Record<string, CriterionScore>;
  maxPossibleScore: number;
}

export class ScoringCalculator {
  private readonly categories = [
    'Business Foundation',
    'Legal Structure', 
    'Banking & Finance',
    'Business Credit Profile',
    'Marketing Presence',
    'Operational Excellence',
    'Documentation',
    'Financial Health'
  ];

  async calculateAdvancedScore(
    criteria: any[], 
    responses: [string, any][]
  ): Promise<{
      totalScore: number;
      categoryScores: any;
      completionPercentage: number;
      criteriaScores: any;
      maxPossibleScore: number;
}> {
    try {
      const categoryScores = this.calculateCategoryScores(criteria, responses);
      const totalScore = this.calculateTotalScore(categoryScores);
      const completionPercentage = this.calculateCompletion(criteria, responses);
      const criteriaScores = this.calculateIndividualScores(criteria, responses);

      return {
        totalScore,
        categoryScores,
        completionPercentage,
        criteriaScores,
        maxPossibleScore: this.calculateMaxScore(criteria)
      };
    } catch (error) {
      throw new Error(`Scoring calculation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private calculateCategoryScores(criteria: any[], responses: [string, any][]): any {
    const responseMap = new Map(responses);
    const categoryScores: any = {};

    this.categories.forEach(category => {
      const categoryCriteria = criteria.filter(c => c.category === category);
      let categoryScore = 0;
      let maxCategoryScore = 0;
      let completedCount = 0;

      categoryCriteria.forEach(criterion => {
        maxCategoryScore += criterion.weight;
        
        if (responseMap.has(criterion.id)) {
          const response = responseMap.get(criterion.id);
          if (this.isValidResponse(response)) {
            categoryScore += this.calculateCriterionScore(criterion, response);
            completedCount++;
          }
        }
      });

      categoryScores[category] = {
        score: categoryScore,
        maxScore: maxCategoryScore,
        percentage: maxCategoryScore > 0 ? (categoryScore / maxCategoryScore) * 100 : 0,
        completedCriteria: completedCount,
        totalCriteria: categoryCriteria.length
      };
    });

    return categoryScores;
  }

  private calculateTotalScore(categoryScores: any): number {
    let totalScore = 0;
    let maxScore = 0;

    Object.values(categoryScores).forEach((category: any) => {
      totalScore += category.score;
      maxScore += category.maxScore;
    });

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }

  private calculateCompletion(criteria: any[], responses: [string, any][]): number {
    const responseMap = new Map(responses);
    const completedCount = criteria.filter(criterion => 
      responseMap.has(criterion.id) && 
      this.isValidResponse(responseMap.get(criterion.id))
    ).length;

    return criteria.length > 0 ? (completedCount / criteria.length) * 100 : 0;
  }

  private calculateIndividualScores(criteria: any[], responses: [string, any][]): any {
    const responseMap = new Map(responses);
    const scores: any = {};

    criteria.forEach(criterion => {
      if (responseMap.has(criterion.id)) {
        const response = responseMap.get(criterion.id);
        scores[criterion.id] = {
          score: this.calculateCriterionScore(criterion, response),
          maxScore: criterion.weight,
          percentage: this.calculateCriterionScore(criterion, response) / criterion.weight * 100
        };
      }
    });

    return scores;
  }

  private calculateCriterionScore(criterion: any, response: any): number {
    switch (criterion.type) {
      case 'boolean':
        return response.value === true ? criterion.weight : 0;
      
      case 'select':
        return this.calculateSelectScore(criterion, response);
      
      case 'number':
        return this.calculateNumberScore(criterion, response);
      
      case 'text':
        return response.value && response.value.trim() ? criterion.weight : 0;
      
      default:
        return 0;
    }
  }

  private calculateSelectScore(criterion: any, response: any): number {
    const scoreMap: any = {
      'Excellent': 1.0,
      'Very Good': 0.8,
      'Good': 0.6,
      'Fair': 0.4,
      'Poor': 0.2,
      'Yes': 1.0,
      'No': 0.0,
      'LLC': 0.8,
      'Corporation': 1.0,
      'Partnership': 0.6,
      'Sole Proprietorship': 0.4
    };

    const multiplier = scoreMap[response.value] || 0;
    return Math.round(criterion.weight * multiplier);
  }

  private calculateNumberScore(criterion: any, response: any): number {
    const value = parseFloat(response.value) || 0;
    
    if (criterion.id.includes('revenue')) {
      return this.calculateRevenueScore(criterion, value);
    } else if (criterion.id.includes('age') || criterion.id.includes('months')) {
      return this.calculateAgeScore(criterion, value);
    }
    
    return value > 0 ? criterion.weight : 0;
  }

  private calculateRevenueScore(criterion: any, revenue: number): number {
    if (revenue >= 1000000) return criterion.weight;
    if (revenue >= 500000) return Math.round(criterion.weight * 0.8);
    if (revenue >= 250000) return Math.round(criterion.weight * 0.6);
    if (revenue >= 100000) return Math.round(criterion.weight * 0.4);
    if (revenue >= 50000) return Math.round(criterion.weight * 0.2);
    return 0;
  }

  private calculateAgeScore(criterion: any, months: number): number {
    if (months >= 24) return criterion.weight;
    if (months >= 12) return Math.round(criterion.weight * 0.7);
    if (months >= 6) return Math.round(criterion.weight * 0.4);
    if (months >= 3) return Math.round(criterion.weight * 0.2);
    return 0;
  }

  private calculateMaxScore(criteria: any[]): number {
    return criteria.reduce((total, criterion) => total + criterion.weight, 0);
  }

  private isValidResponse(response: any): boolean {
    if (!response) return false;
    
    const value = response.value;
    return value !== null && 
           value !== undefined && 
           value !== '' && 
           !(typeof value === 'string' && value.trim() === '');
  }
}