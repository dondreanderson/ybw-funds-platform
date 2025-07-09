export interface FundingOpportunity {
  id: string;
  lenderName: string;
  lenderLogo?: string;
  productType: 'term_loan' | 'line_of_credit' | 'equipment_financing' | 'invoice_factoring' | 'merchant_cash_advance' | 'sba_loan';
  minAmount: number;
  maxAmount: number;
  interestRateMin: number;
  interestRateMax: number;
  termMonthsMin: number;
  termMonthsMax: number;
  minCreditScore: number;
  minTimeInBusiness: number; // months
  minAnnualRevenue: number;
  industryRestrictions: string[];
  requiresCollateral: boolean;
  requiresPersonalGuarantee: boolean;
  avgApprovalTime: string; // e.g., "2-3 weeks"
  fees: {
    originationFee?: number;
    maintenanceFee?: number;
    earlyPaymentPenalty?: boolean;
  };
  features: string[];
  applicationUrl: string;
  description: string;
  eligibilityScore: number; // 0-100 based on user profile
  recommendationReason: string;
  rating: number; // 1-5 stars
  reviewCount: number;
  promoted: boolean;
}

export interface TradeLineOpportunity {
  id: string;
  vendorName: string;
  vendorLogo?: string;
  category: 'utilities' | 'telecommunications' | 'office_supplies' | 'fuel' | 'shipping' | 'software' | 'equipment_rental' | 'professional_services';
  serviceType: string; // e.g., "Business Internet", "Office Supplies", "Fuel Cards"
  creditReportingBureaus: ('experian' | 'equifax' | 'dun_bradstreet')[];
  reportingFrequency: 'monthly' | 'quarterly' | 'per_transaction';
  minCreditScore: number;
  timeInBusinessMin: number; // months
  annualRevenueMin: number;
  industryRestrictions: string[];
  creditLimit: {
    min: number;
    max: number;
    typical: number;
  };
  paymentTerms: string; // e.g., "Net 30", "Net 15"
  benefits: string[];
  fees: {
    setupFee?: number;
    annualFee?: number;
    transactionFee?: number;
  };
  applicationUrl: string;
  description: string;
  eligibilityScore: number; // 0-100 based on user profile
  creditBuildingImpact: 'low' | 'medium' | 'high';
  recommendationReason: string;
  rating: number;
  reviewCount: number;
  promoted: boolean;
  estimatedCreditImpact: string; // e.g., "+5-15 points in 3-6 months"
}

export interface UserProfile {
  creditScore: number;
  timeInBusiness: number;
  annualRevenue: number;
  industry: string;
  businessStructure: string;
  fundingNeeds: {
    amount: number;
    purpose: string;
    timeline: string;
  };
  currentTradeLines: string[];
  fundabilityScore: number;
}

export class OpportunityService {
  private static fundingOpportunities: FundingOpportunity[] = [
    {
      id: 'kabbage-loc',
      lenderName: 'Kabbage',
      productType: 'line_of_credit',
      minAmount: 1000,
      maxAmount: 250000,
      interestRateMin: 12,
      interestRateMax: 36,
      termMonthsMin: 6,
      termMonthsMax: 24,
      minCreditScore: 560,
      minTimeInBusiness: 12,
      minAnnualRevenue: 50000,
      industryRestrictions: [],
      requiresCollateral: false,
      requiresPersonalGuarantee: true,
      avgApprovalTime: '1-2 days',
      fees: {
        originationFee: 0,
        maintenanceFee: 0,
        earlyPaymentPenalty: false
      },
      features: ['Fast approval', 'No collateral', 'Flexible payments'],
      applicationUrl: 'https://kabbage.com/application',
      description: 'Fast, flexible business line of credit with competitive rates',
      eligibilityScore: 0,
      recommendationReason: '',
      rating: 4.2,
      reviewCount: 1248,
      promoted: false
    },
    {
      id: 'ondeck-term',
      lenderName: 'OnDeck',
      productType: 'term_loan',
      minAmount: 5000,
      maxAmount: 500000,
      interestRateMin: 15,
      interestRateMax: 42,
      termMonthsMin: 3,
      termMonthsMax: 36,
      minCreditScore: 600,
      minTimeInBusiness: 12,
      minAnnualRevenue: 100000,
      industryRestrictions: ['adult_entertainment', 'gambling'],
      requiresCollateral: false,
      requiresPersonalGuarantee: true,
      avgApprovalTime: '1-3 days',
      fees: {
        originationFee: 2.5,
        earlyPaymentPenalty: false
      },
      features: ['Quick funding', 'No collateral', 'Transparent pricing'],
      applicationUrl: 'https://ondeck.com/apply',
      description: 'Term loans for established businesses with transparent pricing',
      eligibilityScore: 0,
      recommendationReason: '',
      rating: 4.0,
      reviewCount: 892,
      promoted: true
    },
    {
      id: 'sba-loan',
      lenderName: 'SBA Preferred Lender',
      productType: 'sba_loan',
      minAmount: 25000,
      maxAmount: 5000000,
      interestRateMin: 6,
      interestRateMax: 13,
      termMonthsMin: 12,
      termMonthsMax: 300,
      minCreditScore: 680,
      minTimeInBusiness: 24,
      minAnnualRevenue: 150000,
      industryRestrictions: ['adult_entertainment', 'gambling', 'speculation'],
      requiresCollateral: true,
      requiresPersonalGuarantee: true,
      avgApprovalTime: '4-8 weeks',
      fees: {
        originationFee: 1.5,
        maintenanceFee: 0
      },
      features: ['Low interest rates', 'Long terms', 'SBA guaranteed'],
      applicationUrl: 'https://sba.gov/funding-programs/loans',
      description: 'SBA guaranteed loans with the best rates and terms',
      eligibilityScore: 0,
      recommendationReason: '',
      rating: 4.5,
      reviewCount: 445,
      promoted: false
    }
  ];

  private static tradeLineOpportunities: TradeLineOpportunity[] = [
    {
      id: 'uline-supplies',
      vendorName: 'Uline',
      category: 'office_supplies',
      serviceType: 'Office & Warehouse Supplies',
      creditReportingBureaus: ['experian', 'equifax', 'dun_bradstreet'],
      reportingFrequency: 'monthly',
      minCreditScore: 0,
      timeInBusinessMin: 0,
      annualRevenueMin: 0,
      industryRestrictions: [],
      creditLimit: {
        min: 500,
        max: 50000,
        typical: 5000
      },
      paymentTerms: 'Net 30',
      benefits: ['Builds business credit', 'No personal guarantee', 'Easy approval'],
      fees: {
        setupFee: 0,
        annualFee: 0
      },
      applicationUrl: 'https://uline.com/Account/CreditApplication',
      description: 'Business supplies with excellent credit reporting to all bureaus',
      eligibilityScore: 0,
      creditBuildingImpact: 'high',
      recommendationReason: '',
      rating: 4.6,
      reviewCount: 2341,
      promoted: true,
      estimatedCreditImpact: '+10-20 points in 3-6 months'
    },
    {
      id: 'grainger-supplies',
      vendorName: 'Grainger',
      category: 'office_supplies',
      serviceType: 'Industrial & Business Supplies',
      creditReportingBureaus: ['experian', 'dun_bradstreet'],
      reportingFrequency: 'monthly',
      minCreditScore: 0,
      timeInBusinessMin: 6,
      annualRevenueMin: 25000,
      industryRestrictions: [],
      creditLimit: {
        min: 1000,
        max: 100000,
        typical: 10000
      },
      paymentTerms: 'Net 30',
      benefits: ['Strong credit reporting', 'High credit limits', 'Industry leader'],
      fees: {
        setupFee: 0,
        annualFee: 0
      },
      applicationUrl: 'https://grainger.com/credit-application',
      description: 'Industrial supplies with strong credit reporting history',
      eligibilityScore: 0,
      creditBuildingImpact: 'high',
      recommendationReason: '',
      rating: 4.4,
      reviewCount: 1876,
      promoted: false,
      estimatedCreditImpact: '+8-15 points in 4-6 months'
    },
    {
      id: 'fleet-fuel',
      vendorName: 'Fleet Fuel Cards',
      category: 'fuel',
      serviceType: 'Business Fuel Cards',
      creditReportingBureaus: ['experian', 'equifax'],
      reportingFrequency: 'monthly',
      minCreditScore: 550,
      timeInBusinessMin: 3,
      annualRevenueMin: 50000,
      industryRestrictions: [],
      creditLimit: {
        min: 2000,
        max: 25000,
        typical: 7500
      },
      paymentTerms: 'Net 15',
      benefits: ['Fleet management', 'Credit building', 'Expense tracking'],
      fees: {
        setupFee: 0,
        annualFee: 25,
        transactionFee: 0
      },
      applicationUrl: 'https://fleetfuel.com/apply',
      description: 'Fuel cards that build credit while managing fleet expenses',
      eligibilityScore: 0,
      creditBuildingImpact: 'medium',
      recommendationReason: '',
      rating: 4.1,
      reviewCount: 892,
      promoted: false,
      estimatedCreditImpact: '+5-12 points in 3-6 months'
    },
    {
      id: 'net30-accounts',
      vendorName: 'Net 30 Vendor Network',
      category: 'professional_services',
      serviceType: 'Net 30 Vendor Accounts',
      creditReportingBureaus: ['experian', 'equifax', 'dun_bradstreet'],
      reportingFrequency: 'monthly',
      minCreditScore: 0,
      timeInBusinessMin: 0,
      annualRevenueMin: 0,
      industryRestrictions: [],
      creditLimit: {
        min: 250,
        max: 5000,
        typical: 1500
      },
      paymentTerms: 'Net 30',
      benefits: ['Starter trade lines', 'Easy approval', 'Multiple vendors'],
      fees: {
        setupFee: 89,
        annualFee: 0
      },
      applicationUrl: 'https://net30vendors.com/apply',
      description: 'Starter trade lines perfect for new businesses building credit',
      eligibilityScore: 0,
      creditBuildingImpact: 'medium',
      recommendationReason: '',
      rating: 4.0,
      reviewCount: 634,
      promoted: false,
      estimatedCreditImpact: '+3-8 points in 2-4 months'
    }
  ];

  static getMatchedFundingOpportunities(userProfile: UserProfile): FundingOpportunity[] {
    return this.fundingOpportunities
      .map(opportunity => ({
        ...opportunity,
        eligibilityScore: this.calculateFundingEligibility(opportunity, userProfile),
        recommendationReason: this.generateFundingRecommendation(opportunity, userProfile)
      }))
      .filter(opportunity => opportunity.eligibilityScore > 20) // Only show viable options
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore); // Sort by best match
  }

  static getMatchedTradeLineOpportunities(userProfile: UserProfile): TradeLineOpportunity[] {
    return this.tradeLineOpportunities
      .map(opportunity => ({
        ...opportunity,
        eligibilityScore: this.calculateTradeLineEligibility(opportunity, userProfile),
        recommendationReason: this.generateTradeLineRecommendation(opportunity, userProfile)
      }))
      .filter(opportunity => opportunity.eligibilityScore > 30) // Only show viable options
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore); // Sort by best match
  }

  private static calculateFundingEligibility(opportunity: FundingOpportunity, profile: UserProfile): number {
    let score = 0;
    
    // Credit score match (30 points)
    if (profile.creditScore >= opportunity.minCreditScore + 50) score += 30;
    else if (profile.creditScore >= opportunity.minCreditScore + 20) score += 20;
    else if (profile.creditScore >= opportunity.minCreditScore) score += 10;
    
    // Time in business (20 points)
    if (profile.timeInBusiness >= opportunity.minTimeInBusiness * 2) score += 20;
    else if (profile.timeInBusiness >= opportunity.minTimeInBusiness) score += 10;
    
    // Revenue match (25 points)
    if (profile.annualRevenue >= opportunity.minAnnualRevenue * 3) score += 25;
    else if (profile.annualRevenue >= opportunity.minAnnualRevenue * 2) score += 20;
    else if (profile.annualRevenue >= opportunity.minAnnualRevenue) score += 15;
    
    // Industry restrictions (10 points)
    if (!opportunity.industryRestrictions.includes(profile.industry)) score += 10;
    
    // Fundability score bonus (15 points)
    if (profile.fundabilityScore >= 80) score += 15;
    else if (profile.fundabilityScore >= 60) score += 10;
    else if (profile.fundabilityScore >= 40) score += 5;
    
    return Math.min(score, 100);
  }

  private static calculateTradeLineEligibility(opportunity: TradeLineOpportunity, profile: UserProfile): number {
    let score = 0;
    
    // Credit score match (25 points)
    if (profile.creditScore >= opportunity.minCreditScore + 100) score += 25;
    else if (profile.creditScore >= opportunity.minCreditScore + 50) score += 20;
    else if (profile.creditScore >= opportunity.minCreditScore) score += 15;
    
    // Time in business (20 points)
    if (profile.timeInBusiness >= opportunity.timeInBusinessMin * 2) score += 20;
    else if (profile.timeInBusiness >= opportunity.timeInBusinessMin) score += 15;
    
    // Revenue match (20 points)
    if (profile.annualRevenue >= opportunity.annualRevenueMin * 3) score += 20;
    else if (profile.annualRevenue >= opportunity.annualRevenueMin * 2) score += 15;
    else if (profile.annualRevenue >= opportunity.annualRevenueMin) score += 10;
    
    // Industry fit (15 points)
    if (!opportunity.industryRestrictions.includes(profile.industry)) score += 15;
    
    // Credit building impact (20 points)
    if (opportunity.creditBuildingImpact === 'high') score += 20;
    else if (opportunity.creditBuildingImpact === 'medium') score += 15;
    else score += 10;
    
    return Math.min(score, 100);
  }

  private static generateFundingRecommendation(opportunity: FundingOpportunity, profile: UserProfile): string {
    const reasons = [];
    
    if (profile.creditScore >= opportunity.minCreditScore + 50) {
      reasons.push('Excellent credit score match');
    }
    if (profile.annualRevenue >= opportunity.minAnnualRevenue * 2) {
      reasons.push('Strong revenue qualification');
    }
    if (profile.timeInBusiness >= opportunity.minTimeInBusiness * 2) {
      reasons.push('Well-established business');
    }
    if (opportunity.promoted) {
      reasons.push('Featured lender partner');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Good potential match for your business';
  }

  private static generateTradeLineRecommendation(opportunity: TradeLineOpportunity, profile: UserProfile): string {
    const reasons = [];
    
    if (opportunity.creditBuildingImpact === 'high') {
      reasons.push('High credit building impact');
    }
    if (opportunity.creditReportingBureaus.length >= 3) {
      reasons.push('Reports to all major bureaus');
    }
    if (opportunity.fees.setupFee === 0) {
      reasons.push('No setup fees');
    }
    if (profile.currentTradeLines.length < 3) {
      reasons.push('Perfect for building credit foundation');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Good opportunity for credit building';
  }
}
