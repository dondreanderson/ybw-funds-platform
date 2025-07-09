import { supabase } from '@/lib/supabase';
import { OpportunityService, FundingOpportunity, TradeLineOpportunity, UserProfile } from './opportunityService';

interface EnhancedUserProfile extends UserProfile {
  id: string;
  email: string;
  businessProfile?: {
    industry: string;
    years_in_business: number;
    annual_revenue: number;
    employees_count: number;
    business_structure: string;
  };
  latestAssessment?: {
    overall_score: number;
    category_scores: Record<string, number>;
    completion_percentage: number;
  };
}

interface MatchAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  nextSteps: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export class EnhancedOpportunityService extends OpportunityService {
  
  static async getUserProfile(userId: string): Promise<EnhancedUserProfile | null> {
    try {
      // Get user profile
      const sessionUserId = userId; // This comes from your NextAuth session
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userProfile) {
      // Create basic profile for new users
      const newProfile = {
        id: sessionUserId,
        email: 'user@example.com',
        creditScore: 600, // Default starting score
        timeInBusiness: 1,
        annualRevenue: 100000,
        industry: 'General',
        businessStructure: 'LLC',
        fundingNeeds: { amount: 50000, purpose: 'Working Capital', timeline: '30 days' },
        currentTradeLines: [],
        fundabilityScore: 60 // Default score
      };
      return newProfile;
    }

      // Get business profile
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get latest assessment
      const { data: latestAssessment } = await supabase
        .from('advanced_fundability_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        id: userId,
        email: userProfile.email || '',
        creditScore: userProfile.fundability_score || 0,
        timeInBusiness: businessProfile?.years_in_business || 0,
        annualRevenue: businessProfile?.annual_revenue || 0,
        industry: businessProfile?.industry || '',
        businessStructure: businessProfile?.business_structure || '',
        fundingNeeds: {
          amount: 100000, // Default, should come from user input
          purpose: 'Working Capital',
          timeline: '30 days'
        },
        currentTradeLines: [], // To be populated from credit reports
        fundabilityScore: latestAssessment?.overall_score || 0,
        businessProfile,
        latestAssessment
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async getPersonalizedFundingOpportunities(userId: string): Promise<(FundingOpportunity & { matchAnalysis: MatchAnalysis })[]> {
    //const userProfile = await this.getUserProfile(userId);
    let userProfile = await this.getUserProfile(userId);
    //if (!userProfile) return [];

    if (!userProfile) {
    console.log('🔧 No user profile found, using demo data');
    userProfile = {
      id: userId,
      email: 'demo@ybwfunds.com',
      creditScore: 650,
      timeInBusiness: 2,
      annualRevenue: 250000,
      industry: 'Technology',
      businessStructure: 'LLC',
      fundingNeeds: {
        amount: 100000,
        purpose: 'Working Capital',
        timeline: '30 days'
      },
      currentTradeLines: [], // Empty array means good candidate for building credit
      fundabilityScore: 75
    };
  }

    const opportunities = this.getMatchedFundingOpportunities(userProfile);

    return opportunities.map(opportunity => ({
      ...opportunity,
      matchAnalysis: this.calculateAdvancedFundingMatch(opportunity, userProfile)
    })).sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);
  }

  static async getPersonalizedTradelineOpportunities(userId: string): Promise<(TradeLineOpportunity & { matchAnalysis: MatchAnalysis })[]> {
    //const userProfile = await this.getUserProfile(userId);
    let userProfile = await this.getUserProfile(userId);
    //if (!userProfile) return [];

    // TEMPORARY: If no profile found, use demo profile (same as funding)
  if (!userProfile) {
    console.log('🔧 No user profile found for tradelines, using demo data');
    userProfile = {
      id: userId,
      email: 'demo@ybwfunds.com',
      creditScore: 650,
      timeInBusiness: 2,
      annualRevenue: 250000,
      industry: 'Technology',
      businessStructure: 'LLC',
      fundingNeeds: {
        amount: 100000,
        purpose: 'Working Capital',
        timeline: '30 days'
      },
      currentTradeLines: [], // Empty array means good candidate for building credit
      fundabilityScore: 75
    };
  }

    const opportunities = this.getMatchedTradeLineOpportunities(userProfile);

    return opportunities.map(opportunity => ({
      ...opportunity,
      matchAnalysis: this.calculateAdvancedTradelineMatch(opportunity, userProfile)
    })).sort((a, b) => b.matchAnalysis.score - a.matchAnalysis.score);
  }

  private static calculateAdvancedFundingMatch(opportunity: FundingOpportunity, profile: EnhancedUserProfile): MatchAnalysis {
    let score = 0;
    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Credit Score Analysis (30 points)
    if (profile.fundabilityScore >= opportunity.minCreditScore + 100) {
      score += 30;
      strengths.push('Excellent credit profile for this lender');
    } else if (profile.fundabilityScore >= opportunity.minCreditScore + 50) {
      score += 25;
      strengths.push('Strong credit qualification');
    } else if (profile.fundabilityScore >= opportunity.minCreditScore) {
      score += 15;
      strengths.push('Meets minimum credit requirements');
    } else {
      concerns.push('Credit score below minimum requirement');
      recommendations.push('Focus on improving fundability score first');
    }

    // Revenue Analysis (25 points)
    const revenueRatio = profile.annualRevenue / opportunity.minAnnualRevenue;
    if (revenueRatio >= 3) {
      score += 25;
      strengths.push('Revenue significantly exceeds requirements');
    } else if (revenueRatio >= 2) {
      score += 20;
      strengths.push('Strong revenue qualification');
    } else if (revenueRatio >= 1) {
      score += 15;
      strengths.push('Meets revenue requirements');
    } else {
      concerns.push('Revenue below minimum requirement');
      recommendations.push('Consider revenue-based financing options');
    }

    // Time in Business (20 points)
    const timeRatio = (profile.timeInBusiness * 12) / opportunity.minTimeInBusiness;
    if (timeRatio >= 2) {
      score += 20;
      strengths.push('Well-established business history');
    } else if (timeRatio >= 1) {
      score += 15;
      strengths.push('Meets time in business requirement');
    } else {
      concerns.push('Business too new for this lender');
      recommendations.push('Consider new business financing options');
    }

    // Industry Analysis (10 points)
    if (!opportunity.industryRestrictions.includes(profile.industry)) {
      score += 10;
      strengths.push('Industry approved by lender');
    } else {
      concerns.push('Industry restrictions may apply');
    }

    // Loan Amount Feasibility (15 points)
    const requestedAmount = profile.fundingNeeds.amount;
    if (requestedAmount >= opportunity.minAmount && requestedAmount <= opportunity.maxAmount) {
      score += 15;
      strengths.push('Loan amount within lender range');
    } else if (requestedAmount < opportunity.minAmount) {
      score += 5;
      concerns.push('Requested amount below minimum');
      recommendations.push('Consider increasing loan amount or finding alternative lenders');
    } else {
      concerns.push('Requested amount exceeds maximum');
      recommendations.push('Consider multiple funding sources');
    }

    // Generate next steps
    if (score >= 80) {
      nextSteps.push('Apply immediately - excellent match');
      nextSteps.push('Prepare financial documents');
      nextSteps.push('Review loan terms carefully');
    } else if (score >= 60) {
      nextSteps.push('Review application requirements');
      nextSteps.push('Address any concerns first');
      nextSteps.push('Prepare strong application package');
    } else {
      nextSteps.push('Improve fundability score');
      nextSteps.push('Consider alternative lenders');
      nextSteps.push('Work on business metrics');
    }

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (concerns.length >= 3) riskLevel = 'high';
    else if (concerns.length >= 1) riskLevel = 'medium';

    return {
      score: Math.min(score, 100),
      strengths,
      concerns,
      recommendations,
      nextSteps,
      riskLevel
    };
  }

  private static calculateAdvancedTradelineMatch(opportunity: TradeLineOpportunity, profile: EnhancedUserProfile): MatchAnalysis {
    let score = 0;
    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Credit Building Impact (30 points)
    if (opportunity.creditBuildingImpact === 'high') {
      score += 30;
      strengths.push('High credit building potential');
    } else if (opportunity.creditBuildingImpact === 'medium') {
      score += 20;
      strengths.push('Moderate credit building impact');
    } else {
      score += 10;
    }

    // Bureau Reporting (25 points)
    const bureauCount = opportunity.creditReportingBureaus.length;
    if (bureauCount >= 3) {
      score += 25;
      strengths.push('Reports to all major credit bureaus');
    } else if (bureauCount >= 2) {
      score += 20;
      strengths.push('Reports to multiple bureaus');
    } else {
      score += 15;
    }

    // Qualification (20 points)
    if (profile.fundabilityScore >= opportunity.minCreditScore + 50) {
      score += 20;
      strengths.push('Excellent qualification profile');
    } else if (profile.fundabilityScore >= opportunity.minCreditScore) {
      score += 15;
      strengths.push('Meets qualification requirements');
    } else {
      score += 5;
      concerns.push('May need to improve credit first');
    }

    // Business Age (15 points)
    if ((profile.timeInBusiness * 12) >= opportunity.timeInBusinessMin * 2) {
      score += 15;
      strengths.push('Well-established for this tradeline');
    } else if ((profile.timeInBusiness * 12) >= opportunity.timeInBusinessMin) {
      score += 10;
      strengths.push('Meets time requirements');
    } else {
      concerns.push('Business may be too new');
    }

    // Cost Analysis (10 points)
    if (opportunity.fees.setupFee === 0) {
      score += 10;
      strengths.push('No setup fees required');
    } else if ((opportunity.fees.setupFee || 0) < 100) {
      score += 7;
      strengths.push('Low setup costs');
    } else {
      score += 3;
      concerns.push('Higher setup fees required');
    }

    // Generate recommendations and next steps
    if (opportunity.creditBuildingImpact === 'high') {
      recommendations.push('Prioritize this tradeline for maximum impact');
    }
    
    if (profile.fundabilityScore < 60) {
      recommendations.push('Start with easier approval tradelines');
      nextSteps.push('Apply for starter business accounts');
    } else {
      nextSteps.push('Apply for multiple accounts for faster building');
    }

    nextSteps.push('Ensure timely payments for maximum benefit');
    nextSteps.push('Monitor credit reports monthly');

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (concerns.length >= 2) riskLevel = 'high';
    else if (concerns.length >= 1) riskLevel = 'medium';

    return {
      score: Math.min(score, 100),
      strengths,
      concerns,
      recommendations,
      nextSteps,
      riskLevel
    };
  }

  static async saveFundingMatches(userId: string, matches: any[]): Promise<void> {
    try {
      const matchData = matches.map(match => ({
        user_id: userId,
        funding_opportunity_id: match.id,
        match_score: match.eligibilityScore,
        is_prequalified: match.eligibilityScore >= 70,
        created_at: new Date().toISOString()
      }));

      await supabase
        .from('user_funding_matches')
        .upsert(matchData, { onConflict: 'user_id,funding_opportunity_id' });
    } catch (error) {
      console.error('Error saving funding matches:', error);
    }
  }

  static async trackOpportunityView(userId: string, opportunityId: string, type: 'funding' | 'tradeline'): Promise<void> {
    try {
      await supabase
        .from('marketplace_analytics')
        .insert({
          user_id: userId,
          opportunity_id: opportunityId,
          opportunity_type: type,
          action: 'view'
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  static async trackOpportunityApplication(userId: string, opportunityId: string, type: 'funding' | 'tradeline'): Promise<void> {
    try {
      await supabase
        .from('marketplace_analytics')
        .insert({
          user_id: userId,
          opportunity_id: opportunityId,
          opportunity_type: type,
          action: 'apply'
        });

      // Also save to funding_applications table
      if (type === 'funding') {
        await supabase
          .from('funding_applications')
          .insert({
            user_id: userId,
            opportunity_id: opportunityId,
            status: 'applied',
            applied_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error tracking application:', error);
    }
  }
}