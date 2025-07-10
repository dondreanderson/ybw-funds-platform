import { Lender, LenderMatch, LoanProduct } from '@/types/lender';
import { AssessmentData } from '@/types/assessment';

export class LenderMatchingService {
  
  static async findMatches(
    assessmentData: AssessmentData,
    loanAmount: number,
    loanType?: string,
    maxResults: number = 10
  ): Promise<LenderMatch[]> {
    
    // Get all active lenders
    const lenders = await this.getActiveLenders();
    
    // Calculate match scores for each lender
    const matches: LenderMatch[] = [];
    
    for (const lender of lenders) {
      const matchResult = this.calculateLenderMatch(assessmentData, lender, loanAmount, loanType);
      
      if (matchResult.match_score > 0.3) { // Only include matches above 30%
        matches.push(matchResult);
      }
    }
    
    // Sort by match score (highest first)
    matches.sort((a, b) => b.match_score - a.match_score);
    
    return matches.slice(0, maxResults);
  }
  
  private static calculateLenderMatch(
    assessmentData: AssessmentData,
    lender: Lender,
    loanAmount: number,
    loanType?: string
  ): LenderMatch {
    
    let matchScore = 0;
    const matchReasons: string[] = [];
    const recommendedProducts: LoanProduct[] = [];
    
    // 1. Credit Score Match (25% weight)
    const creditScore = assessmentData.financialHealth.creditScore || 0;
    if (creditScore >= lender.min_credit_score) {
      const creditMatch = Math.min(1, (creditScore - lender.min_credit_score + 100) / 200);
      matchScore += creditMatch * 0.25;
      matchReasons.push(`Credit score of ${creditScore} meets requirements`);
    }
    
    // 2. Loan Amount Match (20% weight)
    if (loanAmount >= lender.min_loan_amount && loanAmount <= lender.max_loan_amount) {
      matchScore += 0.2;
      matchReasons.push(`Loan amount of $${loanAmount.toLocaleString()} is within range`);
    }
    
    // 3. Time in Business Match (15% weight)
    const yearEstablished = assessmentData.businessFoundation.yearEstablished || 0;
    const monthsInBusiness = (new Date().getFullYear() - yearEstablished) * 12;
    if (monthsInBusiness >= lender.min_time_in_business) {
      matchScore += 0.15;
      matchReasons.push(`${Math.floor(monthsInBusiness/12)} years in business meets requirements`);
    }
    
    // 4. Industry Match (10% weight)
    const businessIndustry = assessmentData.industryOperations.industry || '';
    if (lender.industries_served.includes(businessIndustry) || lender.industries_served.includes('All')) {
      matchScore += 0.1;
      matchReasons.push(`Serves ${businessIndustry} industry`);
    }
    
    // 5. Location Match (10% weight)
    const businessState = assessmentData.businessFoundation.state || '';
    if (lender.states_served.includes(businessState) || lender.states_served.includes('All')) {
      matchScore += 0.1;
      matchReasons.push(`Serves ${businessState} state`);
    }
    
    // 6. Revenue Match (10% weight)
    const annualRevenue = assessmentData.financialHealth.annualRevenue || 0;
    if (annualRevenue > 0) {
      // Higher revenue generally improves match
      const revenueScore = Math.min(1, annualRevenue / 1000000); // Scale to $1M
      matchScore += revenueScore * 0.1;
      matchReasons.push(`Annual revenue of $${annualRevenue.toLocaleString()} is strong`);
    }
    
    // 7. Banking Relationship Match (10% weight)
    const bankingYears = assessmentData.bankingRelationships.bankingYears || 0;
    if (bankingYears >= 2) {
      matchScore += 0.1;
      matchReasons.push(`${bankingYears} years of banking history`);
    }
    
    // Find recommended products
    for (const product of lender.loan_products) {
      if (loanType && product.type !== loanType) continue;
      
      if (loanAmount >= product.min_amount && loanAmount <= product.max_amount) {
        recommendedProducts.push(product);
      }
    }
    
    // Calculate estimated approval odds
    const estimatedApprovalOdds = Math.min(95, matchScore * 100 * lender.approval_rate / 100);
    
    // Estimate interest rates based on match score
    const rateReduction = matchScore * 0.2; // Up to 20% reduction for perfect matches
    const estimatedRates = {
      min: Math.max(lender.interest_rate_range.min - rateReduction, 3),
      max: Math.max(lender.interest_rate_range.max - rateReduction, 5)
    };
    
    return {
      lender,
      match_score: matchScore,
      match_reasons: matchReasons,
      recommended_products: recommendedProducts,
      estimated_approval_odds: estimatedApprovalOdds,
      estimated_rates: estimatedRates
    };
  }
  
  private static async getActiveLenders(): Promise<Lender[]> {
    // This would typically fetch from your database
    // For now, return mock data
    return [
      {
        id: '1',
        name: 'Chase Business Banking',
        logo_url: 'https://example.com/chase-logo.png',
        description: 'Full-service business banking with competitive rates',
        lender_type: 'bank',
        min_loan_amount: 10000,
        max_loan_amount: 5000000,
        min_credit_score: 650,
        min_time_in_business: 24,
        interest_rate_range: { min: 6.5, max: 12.5 },
        loan_products: [
          {
            id: '1',
            name: 'Business Term Loan',
            type: 'term_loan',
            min_amount: 10000,
            max_amount: 5000000,
            term_range: { min_months: 12, max_months: 84 },
            interest_rate: { min: 6.5, max: 12.5 },
            fees: { origination_fee: 2.5 },
            collateral_required: true,
            personal_guarantee_required: true,
            features: ['Fixed rates', 'Flexible terms', 'Fast approval']
          }
        ],
        industries_served: ['All'],
        states_served: ['All'],
        requirements: [],
        processing_time: '3-5 business days',
        approval_rate: 85,
        rating: 4.5,
        reviews_count: 1250,
        contact_info: {
          phone: '1-800-CHASE-1',
          website: 'https://www.chase.com/business',
          application_url: 'https://www.chase.com/business/apply'
        },
        partnership_status: 'active',
        commission_rate: 1.5,
        api_integration: {
          has_api: true,
          api_key_required: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      // Add more lenders...
    ];
  }
}