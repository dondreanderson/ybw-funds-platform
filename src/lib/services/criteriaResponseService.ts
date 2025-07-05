import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export class CriteriaResponseService {
  private supabase: SupabaseClient;
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Save individual criterion response
  async saveCriterionResponse(
    assessmentId: string,
    userId: string,
    criterionData: CriterionResponseData
  ): Promise<CriterionResponse> {
    const response = await this.supabase
      .from('fundability_criteria_responses')
      .insert({
        assessment_id: assessmentId,
        user_id: userId,
        category: criterionData.category,
        criterion_id: criterionData.criterionId,
        criterion_name: criterionData.criterionName,
        criterion_description: criterionData.description,
        response_value: criterionData.responseValue,
        response_type: criterionData.responseType,
        points_earned: criterionData.pointsEarned,
        points_possible: criterionData.pointsPossible,
        weight_factor: criterionData.weightFactor || 1.0,
        weighted_score: this.calculateWeightedScore(
          criterionData.pointsEarned,
          criterionData.weightFactor || 1.0
        ),
        is_critical: criterionData.isCritical || false,
        requires_improvement: criterionData.pointsEarned < criterionData.pointsPossible,
        improvement_priority: this.calculateImprovementPriority(criterionData)
      })
      .select()
      .single();

    if (response.error) throw response.error;
    return response.data;
  }

  // Calculate weighted score
  private calculateWeightedScore(pointsEarned: number, weightFactor: number): number {
    return Math.round(pointsEarned * weightFactor * 100) / 100;
  }

  // Calculate improvement priority
  private calculateImprovementPriority(criterionData: CriterionResponseData): number {
    const completionRate = criterionData.pointsEarned / criterionData.pointsPossible;
    if (completionRate === 0 && criterionData.isCritical) return 5; // Highest priority
    if (completionRate < 0.5 && criterionData.isCritical) return 4;
    if (completionRate === 0) return 3;
    if (completionRate < 0.5) return 2;
    if (completionRate < 1.0) return 1;
    return 0; // Complete, no improvement needed
  }
}