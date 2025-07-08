import { supabase } from '@/lib/supabase';
import type { 
  Assessment, 
  AssessmentResponse, 
  CategoryScore, 
  DatabaseResponse 
} from '@/lib/types/core';

export interface AssessmentResult {
  overallScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  categoryScores: CategoryScore[];
  completedCriteria: number;
  totalCriteria: number;
  completionPercentage: number;
  recommendations: string[];
  improvementAreas: string[];
  strengths: string[];
}

export class AssessmentEngine {
  // Category weights for scoring
  private static readonly CATEGORY_WEIGHTS: Record<string, number> = {
    'Business Foundation': 1.2,
    'Legal Structure': 1.1,
    'Banking & Finance': 1.3,
    'Business Credit Profile': 1.4,
    'Marketing Presence': 1.0,
    'Operational Excellence': 1.0,
    'Documentation': 1.1,
    'Financial Health': 1.2
  };

  // Calculate comprehensive assessment score
  static calculateAssessmentScore(responses: AssessmentResponse[]): AssessmentResult {
    try {
      // Group responses by category
      const categoryGroups = this.groupResponsesByCategory(responses);
      
      // Calculate category scores
      const categoryScores: CategoryScore[] = [];
      let totalWeightedScore = 0;
      let totalMaxWeightedScore = 0;
      let totalCompleted = 0;
      let totalCriteria = responses.length;

      for (const [category, categoryResponses] of Object.entries(categoryGroups)) {
        const categoryScore = this.calculateCategoryScore(category, categoryResponses);
        categoryScores.push(categoryScore);
        
        totalWeightedScore += categoryScore.weightedScore;
        totalMaxWeightedScore += categoryScore.maxScore * categoryScore.weight;
        totalCompleted += categoryScore.completedCriteria;
      }

      // Calculate overall metrics
      const percentageScore = totalMaxWeightedScore > 0 
        ? (totalWeightedScore / totalMaxWeightedScore) * 100 
        : 0;
      
      const overallScore = Math.round(percentageScore);
      const completionPercentage = totalCriteria > 0 
        ? (totalCompleted / totalCriteria) * 100 
        : 0;

      // Generate recommendations and insights
      const recommendations = this.generateRecommendations(categoryScores);
      const improvementAreas = this.identifyImprovementAreas(categoryScores);
      const strengths = this.identifyStrengths(categoryScores);

      return {
        overallScore,
        maxPossibleScore: Math.round(totalMaxWeightedScore),
        percentageScore: Math.round(percentageScore * 100) / 100,
        categoryScores,
        completedCriteria: totalCompleted,
        totalCriteria,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        recommendations,
        improvementAreas,
        strengths
      };
    } catch (error) {
      console.error('Error calculating assessment score:', error);
      throw error;
    }
  }

  // Save assessment to database
  static async saveAssessment(
    userId: string,
    assessmentResult: AssessmentResult
  ): Promise<DatabaseResponse<Assessment>> {
    try {
      // Convert category scores to a simple object for storage
      const categoryScoresObj = assessmentResult.categoryScores.reduce((acc, cat) => {
        acc[cat.category] = cat.score;
        return acc;
      }, {} as Record<string, number>);

      const { data, error } = await supabase
        .from('advanced_fundability_assessments')
        .insert({
          user_id: userId,
          overall_score: assessmentResult.overallScore,
          category_scores: categoryScoresObj,
          completion_percentage: assessmentResult.completionPercentage,
          recommendations: assessmentResult.recommendations,
          improvement_areas: assessmentResult.improvementAreas,
          strengths: assessmentResult.strengths,
          status: 'completed',
          assessment_version: '2.0'
        })
        .select()
        .single();

      if (!error && data) {
        // Save to score history
        await this.saveScoreHistory(userId, data.id, assessmentResult);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Save score history
  static async saveScoreHistory(
    userId: string,
    assessmentId: string,
    assessmentResult: AssessmentResult
  ): Promise<DatabaseResponse<any>> {
    try {
      // Get previous score for change calculation
      const { data: previousHistory } = await supabase
        .from('score_history')
        .select('overall_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const scoreChange = previousHistory 
        ? assessmentResult.overallScore - previousHistory.overall_score
        : 0;

      const categoryScoresObj = assessmentResult.categoryScores.reduce((acc, cat) => {
        acc[cat.category] = cat.score;
        return acc;
      }, {} as Record<string, number>);

      const { data, error } = await supabase
        .from('score_history')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          overall_score: assessmentResult.overallScore,
          category_scores: categoryScoresObj,
          assessment_date: new Date().toISOString().split('T')[0],
          score_change: scoreChange
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Private helper methods
  private static groupResponsesByCategory(responses: AssessmentResponse[]): Record<string, AssessmentResponse[]> {
    return responses.reduce((groups, response) => {
      const category = response.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(response);
      return groups;
    }, {} as Record<string, AssessmentResponse[]>);
  }

  private static calculateCategoryScore(category: string, responses: AssessmentResponse[]): CategoryScore {
    let categoryScore = 0;
    let maxCategoryScore = 0;
    let completedCriteria = 0;
    const totalCriteria = responses.length;

    const weight = this.CATEGORY_WEIGHTS[category] || 1.0;

    responses.forEach(response => {
      const criterionWeight = response.weightFactor || 1;
      maxCategoryScore += response.pointsPossible * criterionWeight;
      
      if (response.responseValue !== null && response.responseValue !== undefined) {
        completedCriteria++;
        categoryScore += response.pointsEarned * criterionWeight;
      }
    });

    const percentage = maxCategoryScore > 0 ? (categoryScore / maxCategoryScore) * 100 : 0;
    const weightedScore = categoryScore * weight;

    return {
      category,
      score: Math.round(categoryScore),
      maxScore: Math.round(maxCategoryScore),
      percentage: Math.round(percentage * 100) / 100,
      weight,
      weightedScore: Math.round(weightedScore),
      completedCriteria,
      totalCriteria
    };
  }

  private static generateRecommendations(categoryScores: CategoryScore[]): string[] {
    const recommendations: string[] = [];
    
    categoryScores
      .filter(cat => cat.percentage < 80)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5)
      .forEach(category => {
        recommendations.push(this.getCategoryRecommendation(category.category, category.percentage));
      });

    return recommendations;
  }

  private static identifyImprovementAreas(categoryScores: CategoryScore[]): string[] {
    return categoryScores
      .filter(cat => cat.percentage < 70)
      .sort((a, b) => a.percentage - b.percentage)
      .map(cat => cat.category);
  }

  private static identifyStrengths(categoryScores: CategoryScore[]): string[] {
    return categoryScores
      .filter(cat => cat.percentage >= 85)
      .sort((a, b) => b.percentage - a.percentage)
      .map(cat => cat.category);
  }

  private static getCategoryRecommendation(category: string, percentage: number): string {
    const urgency = percentage < 50 ? 'immediately' : percentage < 70 ? 'soon' : 'when possible';
    
    const recommendations: Record<string, string> = {
      'Business Foundation': `Strengthen your business foundation ${urgency}. Focus on completing business registration and establishing core business infrastructure.`,
      'Legal Structure': `Improve your legal structure ${urgency}. Ensure all business licenses and legal documentation are current and complete.`,
      'Banking & Finance': `Enhance your banking relationships ${urgency}. Consider opening dedicated business accounts and establishing banking relationships.`,
      'Business Credit Profile': `Build your business credit profile ${urgency}. Apply for business credit accounts and monitor your business credit reports.`,
      'Marketing Presence': `Develop your marketing presence ${urgency}. Create professional online presence and marketing materials.`,
      'Operational Excellence': `Improve operational systems ${urgency}. Implement business processes and operational procedures.`,
      'Documentation': `Complete business documentation ${urgency}. Organize and maintain all required business documents.`,
      'Financial Health': `Strengthen financial health ${urgency}. Focus on improving cash flow and financial management practices.`
    };

    return recommendations[category] || `Improve ${category.toLowerCase()} ${urgency} to increase your fundability score.`;
  }
}
