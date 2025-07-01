import { FundabilityCriteria, FundabilityScore, FundabilityRecommendation } from '@/types/fundability';

export class FundabilityEngine {
  private static weights = {
    businessFoundation: 20,
    contactInfo: 15,
    banking: 15,
    credit: 20,
    legal: 10,
    financial: 10,
    digital: 5,
    industry: 5
  };

  static calculateScore(criteria: FundabilityCriteria): FundabilityScore {
    const categoryScores = {
      businessFoundation: this.calculateBusinessFoundationScore(criteria.businessStructure),
      contactInfo: this.calculateContactInfoScore(criteria.contactInfo),
      banking: this.calculateBankingScore(criteria.banking),
      credit: this.calculateCreditScore(criteria.credit),
      legal: this.calculateLegalScore(criteria.legal),
      financial: this.calculateFinancialScore(criteria.financial),
      digital: this.calculateDigitalScore(criteria.digital),
      industry: this.calculateIndustryScore(criteria.industry)
    };

    const totalScore = Object.entries(categoryScores).reduce((total, [category, score]) => {
      const weight = this.weights[category as keyof typeof this.weights];
      return total + (score * weight / 100);
    }, 0);

    const percentage = Math.round(totalScore);
    const grade = this.calculateGrade(percentage);

    return {
      totalScore: Math.round(totalScore),
      maxScore: 100,
      percentage,
      grade,
      categoryScores
    };
  }

  private static calculateBusinessFoundationScore(structure: FundabilityCriteria['businessStructure']): number {
    let score = 0;
    
    if (structure.hasEIN) score += 25;
    if (structure.businessType === 'LLC' || structure.businessType === 'Corporation') score += 20;
    if (structure.yearsInBusiness >= 2) score += 25;
    if (structure.yearsInBusiness >= 5) score += 10;
    if (structure.hasBusinessLicense) score += 20;
    
    return Math.min(score, 100);
  }

  private static calculateContactInfoScore(contact: FundabilityCriteria['contactInfo']): number {
    let score = 0;
    
    if (contact.hasBusinessAddress) score += 25;
    if (contact.hasDedicatedBusinessPhone) score += 25;
    if (contact.hasBusinessEmail) score += 20;
    if (contact.hasBusinessWebsite) score += 20;
    if (contact.has411Listing) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateBankingScore(banking: FundabilityCriteria['banking']): number {
    let score = 0;
    
    if (banking.hasBusinessBankAccount) score += 30;
    if (banking.separatesPersonalBusiness) score += 25;
    if (banking.hasPositiveBalance) score += 20;
    if (banking.hasBusinessCreditCard) score += 15;
    if (banking.accountAgeMonths >= 12) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateCreditScore(credit: FundabilityCriteria['credit']): number {
    let score = 0;
    
    if (credit.hasBusinessCreditProfile) score += 25;
    if (credit.personalCreditScore >= 700) score += 30;
    else if (credit.personalCreditScore >= 650) score += 20;
    else if (credit.personalCreditScore >= 600) score += 10;
    
    if (credit.hasTradeLines) score += 20;
    if (credit.numberOfTradeLines >= 3) score += 15;
    if (!credit.hasPublicRecords) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateLegalScore(legal: FundabilityCriteria['legal']): number {
    let score = 0;
    
    if (legal.hasBusinessInsurance) score += 25;
    if (legal.hasProperDocumentation) score += 25;
    if (legal.hasOperatingAgreement) score += 20;
    if (legal.compliantWithRegulations) score += 20;
    if (legal.hasIntellectualProperty) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateFinancialScore(financial: FundabilityCriteria['financial']): number {
    let score = 0;
    
    if (financial.annualRevenue >= 100000) score += 30;
    else if (financial.annualRevenue >= 50000) score += 20;
    else if (financial.annualRevenue >= 25000) score += 10;
    
    if (financial.profitMargin >= 10) score += 25;
    else if (financial.profitMargin >= 5) score += 15;
    
    if (financial.hasFinancialStatements) score += 20;
    if (financial.hasAccountant) score += 15;
    if (financial.cashFlowPositive) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateDigitalScore(digital: FundabilityCriteria['digital']): number {
    let score = 0;
    
    if (digital.hasGoogleMyBusiness) score += 25;
    if (digital.hasSocialMediaPresence) score += 20;
    if (digital.hasOnlineReviews) score += 20;
    if (digital.averageReviewRating >= 4.0) score += 20;
    if (digital.hasSeoPractices) score += 15;
    
    return Math.min(score, 100);
  }

  private static calculateIndustryScore(industry: FundabilityCriteria['industry']): number {
    let score = 0;
    
    if (industry.marketStability === 'High') score += 30;
    else if (industry.marketStability === 'Medium') score += 20;
    else score += 10;
    
    if (industry.competitivePosition === 'Strong') score += 25;
    else if (industry.competitivePosition === 'Average') score += 15;
    else score += 5;
    
    if (industry.hasIndustryExperience) score += 25;
    if (industry.regulatoryCompliance) score += 20;
    
    return Math.min(score, 100);
  }

  private static calculateGrade(percentage: number): FundabilityScore['grade'] {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  static generateRecommendations(criteria: FundabilityCriteria, score: FundabilityScore): FundabilityRecommendation[] {
    const recommendations: FundabilityRecommendation[] = [];
    
    // Business Foundation Recommendations
    if (!criteria.businessStructure.hasEIN) {
      recommendations.push({
        id: 'ein-required',
        category: 'Business Foundation',
        priority: 'High',
        title: 'Obtain Federal EIN',
        description: 'An Employer Identification Number (EIN) is essential for business credit.',
        actionItems: [
          'Apply for EIN through IRS website',
          'Ensure all business documents reflect the EIN',
          'Use EIN for all business financial accounts'
        ],
        estimatedImpact: 25,
        timeToComplete: '1-2 days',
        cost: 'Free'
      });
    }
    
    if (!criteria.contactInfo.hasDedicatedBusinessPhone) {
      recommendations.push({
        id: 'business-phone',
        category: 'Contact Information',
        priority: 'High',
        title: 'Establish Dedicated Business Phone',
        description: 'A dedicated business phone line improves credibility and fundability.',
        actionItems: [
          'Set up a dedicated business phone line',
          'List phone in business directories',
          'Use business phone on all applications'
        ],
        estimatedImpact: 25,
        timeToComplete: '1 week',
        cost: 'Low'
      });
    }
    
    if (!criteria.banking.hasBusinessBankAccount) {
      recommendations.push({
        id: 'business-banking',
        category: 'Banking',
        priority: 'High',
        title: 'Open Business Bank Account',
        description: 'Separate business banking is crucial for credit building.',
        actionItems: [
          'Research business banking options',
          'Open dedicated business checking account',
          'Maintain positive balance consistently'
        ],
        estimatedImpact: 30,
        timeToComplete: '1-2 weeks',
        cost: 'Low'
      });
    }
    
    if (criteria.credit.personalCreditScore < 650) {
      recommendations.push({
        id: 'improve-personal-credit',
        category: 'Credit',
        priority: 'High',
        title: 'Improve Personal Credit Score',
        description: 'Personal credit directly impacts business funding eligibility.',
        actionItems: [
          'Pay down existing debt',
          'Correct any credit report errors',
          'Set up automatic payments',
          'Reduce credit utilization below 30%'
        ],
        estimatedImpact: 30,
        timeToComplete: '3-6 months',
        cost: 'Medium'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}