import { AssessmentData } from '@/types/assessment';

export function calculatePreviewScore(data: AssessmentData): number {
  let totalScore = 0;
  let maxScore = 0;

  // Business Foundation Score (20 points)
  const businessFoundation = data.businessFoundation;
  if (businessFoundation) {
    let foundationScore = 0;
    
    if (businessFoundation.businessName) foundationScore += 3;
    if (businessFoundation.ein) foundationScore += 4;
    if (businessFoundation.businessType) foundationScore += 3;
    if (businessFoundation.yearEstablished) {
      const yearsInBusiness = new Date().getFullYear() - businessFoundation.yearEstablished;
      if (yearsInBusiness >= 5) foundationScore += 4;
      else if (yearsInBusiness >= 2) foundationScore += 3;
      else if (yearsInBusiness >= 1) foundationScore += 2;
      else foundationScore += 1;
    }
    if (businessFoundation.businessAddress) foundationScore += 3;
    if (businessFoundation.website) foundationScore += 3;
    
    totalScore += foundationScore;
    maxScore += 20;
  }

  // Financial Health Score (30 points)
  const financialHealth = data.financialHealth;
  if (financialHealth) {
    let financialScore = 0;
    
    if (financialHealth.annualRevenue) {
      if (financialHealth.annualRevenue >= 1000000) financialScore += 8;
      else if (financialHealth.annualRevenue >= 500000) financialScore += 6;
      else if (financialHealth.annualRevenue >= 100000) financialScore += 4;
      else if (financialHealth.annualRevenue >= 50000) financialScore += 2;
      else financialScore += 1;
    }
    
    if (financialHealth.creditScore) {
      if (financialHealth.creditScore >= 750) financialScore += 8;
      else if (financialHealth.creditScore >= 700) financialScore += 6;
      else if (financialHealth.creditScore >= 650) financialScore += 4;
      else if (financialHealth.creditScore >= 600) financialScore += 2;
      else financialScore += 1;
    }
    
    if (financialHealth.cashFlow === 'positive') financialScore += 6;
    else if (financialHealth.cashFlow === 'breakeven') financialScore += 3;
    else if (financialHealth.cashFlow === 'negative') financialScore += 1;
    
    if (financialHealth.profitMargin) {
      if (financialHealth.profitMargin >= 20) financialScore += 4;
      else if (financialHealth.profitMargin >= 10) financialScore += 3;
      else if (financialHealth.profitMargin >= 5) financialScore += 2;
      else financialScore += 1;
    }
    
    if (financialHealth.hasAccountant) financialScore += 2;
    if (financialHealth.taxesUpToDate) financialScore += 2;
    
    totalScore += financialScore;
    maxScore += 30;
  }

  // Banking Relationships Score (20 points)
  const banking = data.bankingRelationships;
  if (banking) {
    let bankingScore = 0;
    
    if (banking.bankingYears) {
      if (banking.bankingYears >= 5) bankingScore += 5;
      else if (banking.bankingYears >= 3) bankingScore += 4;
      else if (banking.bankingYears >= 2) bankingScore += 3;
      else bankingScore += 2;
    }
    
    if (banking.hasBusinessChecking) bankingScore += 3;
    if (banking.hasBusinessSavings) bankingScore += 2;
    if (banking.hasBusinessCreditCard) bankingScore += 3;
    if (banking.hasLineOfCredit) bankingScore += 4;
    
    if (banking.averageBalance) {
      if (banking.averageBalance >= 50000) bankingScore += 3;
      else if (banking.averageBalance >= 25000) bankingScore += 2;
      else if (banking.averageBalance >= 10000) bankingScore += 1;
    }
    
    totalScore += bankingScore;
    maxScore += 20;
  }

  // Digital Presence Score (15 points)
  const digital = data.digitalPresence;
  if (digital) {
    let digitalScore = 0;
    
    if (digital.hasWebsite) digitalScore += 4;
    if (digital.hasGoogleBusiness) digitalScore += 3;
    if (digital.hasSocialMedia) digitalScore += 2;
    if (digital.hasOnlineStore) digitalScore += 3;
    
    if (digital.onlineReviews) {
      if (digital.onlineReviews >= 50) digitalScore += 2;
      else if (digital.onlineReviews >= 20) digitalScore += 1;
    }
    
    if (digital.averageRating) {
      if (digital.averageRating >= 4.5) digitalScore += 1;
    }
    
    totalScore += digitalScore;
    maxScore += 15;
  }

  // Industry & Operations Score (15 points)
  const industry = data.industryOperations;
  if (industry) {
    let industryScore = 0;
    
    if (industry.numberOfEmployees) {
      if (industry.numberOfEmployees >= 25) industryScore += 4;
      else if (industry.numberOfEmployees >= 10) industryScore += 3;
      else if (industry.numberOfEmployees >= 5) industryScore += 2;
      else industryScore += 1;
    }
    
    if (industry.hasPhysicalLocation) industryScore += 3;
    if (industry.hasInsurance) industryScore += 3;
    if (industry.hasContracts) industryScore += 2;
    if (industry.hasInventory) industryScore += 2;
    if (industry.hasEquipment) industryScore += 1;
    
    totalScore += industryScore;
    maxScore += 15;
  }

  // Calculate percentage score
  if (maxScore === 0) return 0;
  return Math.round((totalScore / maxScore) * 100);
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A - Excellent';
  if (score >= 80) return 'B - Good';
  if (score >= 70) return 'C - Fair';
  if (score >= 60) return 'D - Poor';
  return 'F - Very Poor';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}