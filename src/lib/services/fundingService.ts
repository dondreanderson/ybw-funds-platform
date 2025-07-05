export class FundingService {
  constructor(private supabase: SupabaseClient) {}

  // Get matched funding opportunities
  async getMatchedOpportunities(userId: string, businessProfile: any) {
    const { data: opportunities, error } = await supabase
      .from('funding_opportunities')
      .select('*')
      .eq('is_active', true)
      .filter('min_credit_score', 'lte', businessProfile.fundability_score || 0)
      .filter('minimum_annual_revenue', 'lte', businessProfile.annual_revenue || 0)
      .filter('minimum_time_in_business', 'lte', businessProfile.years_in_business || 0)

    if (error) throw error

    // Create user funding matches
    const matches = []
    for (const opportunity of opportunities) {
      const matchScore = this.calculateMatchScore(opportunity, businessProfile)
      
      if (matchScore >= 60) {
        const { data: match, error: matchError } = await supabase
          .from('user_funding_matches')
          .upsert({
            user_id: userId,
            funding_opportunity_id: opportunity.id,
            match_score: matchScore,
            is_prequalified: matchScore >= 80
          })
          .select()
          .single()

        if (!matchError) {
          matches.push({ ...opportunity, match_score: matchScore, match_id: match.id })
        }
      }
    }

    return matches.sort((a, b) => b.match_score - a.match_score)
  }

  private calculateMatchScore(opportunity: any, profile: any): number {
    let score = 0

    // Credit score match (30%)
    if (profile.fundability_score >= opportunity.min_credit_score) {
      score += 30
    }

    // Revenue match (25%)
    if (profile.annual_revenue >= opportunity.minimum_annual_revenue) {
      score += 25
    }

    // Time in business match (20%)
    if (profile.years_in_business >= opportunity.minimum_time_in_business) {
      score += 20
    }

    // Industry match (15%)
    if (!opportunity.industry_restrictions || 
        opportunity.industry_restrictions.includes(profile.industry)) {
      score += 15
    }

    // Personal guarantee preference (10%)
    if (!opportunity.requires_personal_guarantee) {
      score += 10
    }

    return Math.min(score, 100)
  }
}