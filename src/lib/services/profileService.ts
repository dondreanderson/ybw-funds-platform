export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  // Update business profile
  async updateBusinessProfile(userId: string, profileData: {
    businessName?: string
    businessType?: string
    industry?: string
    yearsInBusiness?: number
    annualRevenue?: number
    employeesCount?: number
    hasEin?: boolean
    hasBusinessAddress?: boolean
    hasBusinessPhone?: boolean
    hasBusinessWebsite?: boolean
    hasBusinessEmail?: boolean
    hasDunsNumber?: boolean
  }) {
    const { data, error } = await supabase
      .from('business_profiles')
      .upsert({
        user_id: userId,
        business_structure: profileData.businessType,
        industry: profileData.industry,
        years_in_business: profileData.yearsInBusiness,
        annual_revenue: profileData.annualRevenue,
        employees_count: profileData.employeesCount,
        has_ein: profileData.hasEin,
        has_business_address: profileData.hasBusinessAddress,
        has_business_phone: profileData.hasBusinessPhone,
        has_business_website: profileData.hasBusinessWebsite,
        has_business_email: profileData.hasBusinessEmail,
        has_duns_number: profileData.hasDunsNumber,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update user profile
  async updateUserProfile(userId: string, profileData: {
    businessName?: string
    businessEin?: string
    businessPhone?: string
    businessAddress?: string
    businessWebsite?: string
    fundabilityScore?: number
    subscriptionTier?: string
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        business_name: profileData.businessName,
        business_ein: profileData.businessEin,
        business_phone: profileData.businessPhone,
        business_address: profileData.businessAddress,
        business_website: profileData.businessWebsite,
        fundability_score: profileData.fundabilityScore,
        subscription_tier: profileData.subscriptionTier,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get complete user profile
  async getCompleteUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        business_profiles(*),
        fundability_scores(*),
        score_history(*)
      `)
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }
}