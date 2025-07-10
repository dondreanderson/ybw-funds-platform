import type { AIAssessmentResult, Recommendation } from '@/lib/types/database'

interface BusinessData {
  businessStructure: {
    hasEIN: boolean
    businessType: string
    stateOfIncorporation: string
    yearsInBusiness: number
    hasBusinessLicense: boolean
    hasDBA: boolean
  }
  
  financials: {
    annualRevenue: number
    monthlyRevenue: number
    cashFlow: number
    hasBusinessBankAccount: boolean
    separateBusinessCredit: boolean
    personalCreditScore?: number
    businessCreditScore?: number
  }
  
  digitalPresence: {
    hasBusinessAddress: boolean
    hasDedicatedBusinessPhone: boolean
    hasBusinessEmail: boolean
    hasBusinessWebsite: boolean
    has411Listing: boolean
    googleMyBusinessOptimized: boolean
    socialMediaPresence: number
  }
  
  banking: {
    businessBankAccountAge: number
    numberOfBankAccounts: number
    hasBusinessCreditCards: boolean
    averageAccountBalance: number
    overdraftHistory: number
  }
  
  industry: {
    industryType: string
    riskLevel: 'low' | 'medium' | 'high'
    seasonality: boolean
    regulatoryCompliance: boolean
  }
}

interface CategoryScores {
  businessFoundation: number
  financial: number
  digitalPresence: number
  banking: number
  industry: number
}

export class AIAssessmentEngine {
  private weights = {
    businessFoundation: 0.25,
    financial: 0.30,
    digitalPresence: 0.15,
    banking: 0.20,
    industry: 0.10
  }

  async assessBusiness(data: BusinessData): Promise<AIAssessmentResult> {
    // Calculate category scores
    const categoryScores: CategoryScores = {
      businessFoundation: this.assessBusinessFoundation(data.businessStructure),
      financial: this.assessFinancials(data.financials),
      digitalPresence: this.assessDigitalPresence(data.digitalPresence),
      banking: this.assessBanking(data.banking),
      industry: this.assessIndustry(data.industry)
    }

    // Calculate weighted overall score
    const overallScore = Math.round(
      categoryScores.businessFoundation * this.weights.businessFoundation +
      categoryScores.financial * this.weights.financial +
      categoryScores.digitalPresence * this.weights.digitalPresence +
      categoryScores.banking * this.weights.banking +
      categoryScores.industry * this.weights.industry
    )

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(categoryScores, data)

    // Generate funding potential
    const fundingPotential = this.calculateFundingPotential(overallScore, data)

    // Generate AI recommendations
    const recommendations = await this.generateRecommendations(categoryScores, data)

    // Generate next steps
    const nextSteps = this.generateNextSteps(recommendations)

    return {
      overallScore,
      categoryScores,
      riskLevel,
      fundingPotential,
      recommendations,
      nextSteps
    }
  }

  private assessBusinessFoundation(structure: BusinessData['businessStructure']): number {
    let score = 0

    if (structure.hasEIN) score += 25

    const businessTypeScores: Record<string, number> = {
      'LLC': 20,
      'Corporation': 20,
      'S-Corp': 18,
      'Partnership': 15,
      'Sole Proprietorship': 10
    }
    score += businessTypeScores[structure.businessType] || 5

    if (structure.yearsInBusiness >= 2) score += 25
    else if (structure.yearsInBusiness >= 1) score += 15
    else score += 5

    if (structure.hasBusinessLicense) score += 15
    if (structure.hasDBA) score += 10
    if (structure.stateOfIncorporation) score += 5

    return Math.min(score, 100)
  }

  private assessFinancials(financials: BusinessData['financials']): number {
    let score = 0

    if (financials.annualRevenue >= 500000) score += 30
    else if (financials.annualRevenue >= 250000) score += 25
    else if (financials.annualRevenue >= 100000) score += 20
    else if (financials.annualRevenue >= 50000) score += 15
    else if (financials.annualRevenue >= 25000) score += 10
    else score += 5

    const cashFlowRatio = financials.cashFlow / financials.monthlyRevenue
    if (cashFlowRatio >= 0.3) score += 25
    else if (cashFlowRatio >= 0.2) score += 20
    else if (cashFlowRatio >= 0.1) score += 15
    else if (cashFlowRatio >= 0.05) score += 10
    else score += 5

    if (financials.hasBusinessBankAccount) score += 20
    if (financials.separateBusinessCredit) score += 15

    if (financials.businessCreditScore && financials.businessCreditScore >= 80) score += 10
    else if (financials.personalCreditScore && financials.personalCreditScore >= 700) score += 8
    else if (financials.personalCreditScore && financials.personalCreditScore >= 650) score += 5

    return Math.min(score, 100)
  }

  private assessDigitalPresence(digital: BusinessData['digitalPresence']): number {
    let score = 0

    if (digital.hasBusinessAddress) score += 20
    if (digital.hasDedicatedBusinessPhone) score += 20
    if (digital.hasBusinessEmail) score += 15
    if (digital.hasBusinessWebsite) score += 20
    if (digital.has411Listing) score += 10
    if (digital.googleMyBusinessOptimized) score += 10
    score += digital.socialMediaPresence

    return Math.min(score, 100)
  }

  private assessBanking(banking: BusinessData['banking']): number {
    let score = 0

    if (banking.businessBankAccountAge >= 24) score += 30
    else if (banking.businessBankAccountAge >= 12) score += 20
    else if (banking.businessBankAccountAge >= 6) score += 15
    else if (banking.businessBankAccountAge >= 3) score += 10
    else score += 5

    if (banking.numberOfBankAccounts >= 3) score += 20
    else if (banking.numberOfBankAccounts >= 2) score += 15
    else if (banking.numberOfBankAccounts >= 1) score += 10

    if (banking.hasBusinessCreditCards) score += 20

    if (banking.averageAccountBalance >= 50000) score += 20
    else if (banking.averageAccountBalance >= 25000) score += 15
    else if (banking.averageAccountBalance >= 10000) score += 10
    else if (banking.averageAccountBalance >= 5000) score += 5

    score += Math.max(0, 10 - banking.overdraftHistory * 2)

    return Math.min(score, 100)
  }

  private assessIndustry(industry: BusinessData['industry']): number {
    let score = 50

    const riskAdjustments = {
      'low': 30,
      'medium': 0,
      'high': -20
    }
    score += riskAdjustments[industry.riskLevel]

    if (industry.seasonality) score -= 10
    if (industry.regulatoryCompliance) score += 20

    return Math.max(0, Math.min(score, 100))
  }

  private calculateRiskLevel(scores: CategoryScores, data: BusinessData): 'low' | 'medium' | 'high' {
    const scoreValues: number[] = [
      scores.businessFoundation,
      scores.financial,
      scores.digitalPresence,
      scores.banking,
      scores.industry
    ]
    
    const avgScore = scoreValues.reduce((sum: number, score: number) => sum + score, 0) / scoreValues.length

    if (avgScore >= 80 && data.financials.annualRevenue >= 100000) return 'low'
    if (avgScore >= 60 && data.financials.annualRevenue >= 50000) return 'medium'
    return 'high'
  }

  private calculateFundingPotential(score: number, data: BusinessData) {
    let maxAmount = 0
    let timeToFunding = 30
    const recommendedProducts: string[] = []

    const revenueMultiplier = score >= 80 ? 0.3 : score >= 60 ? 0.2 : 0.1
    maxAmount = data.financials.annualRevenue * revenueMultiplier

    if (score >= 80) {
      timeToFunding = 7
      recommendedProducts.push('SBA Loans', 'Business Lines of Credit', 'Equipment Financing')
    } else if (score >= 60) {
      timeToFunding = 14
      recommendedProducts.push('Business Term Loans', 'Working Capital Loans', 'Invoice Factoring')
    } else {
      timeToFunding = 30
      recommendedProducts.push('Alternative Lending', 'Merchant Cash Advance', 'Revenue-Based Financing')
    }

    return {
      maxAmount: Math.round(maxAmount),
      recommendedProducts,
      timeToFunding
    }
  }

  private async generateRecommendations(scores: CategoryScores, data: BusinessData): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    if (scores.businessFoundation < 80) {
      if (!data.businessStructure.hasEIN) {
        recommendations.push({
          id: 'get-ein',
          category: 'Business Foundation',
          title: 'Obtain Federal EIN',
          description: 'Get your Federal Employer Identification Number to establish business credit identity.',
          priority: 'critical',
          impact: 25,
          effort: 'easy',
          timeframe: '1-2 days',
          actionItems: [
            'Visit IRS website (irs.gov)',
            'Complete Form SS-4 online',
            'Receive EIN immediately online'
          ],
          resources: [
            {
              title: 'Apply for EIN Online',
              url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
              type: 'tool'
            }
          ]
        })
      }

      if (data.businessStructure.yearsInBusiness < 2) {
        recommendations.push({
          id: 'build-business-history',
          category: 'Business Foundation',
          title: 'Build Business History',
          description: 'Establish consistent business operations and document your business activities.',
          priority: 'high',
          impact: 15,
          effort: 'medium',
          timeframe: '6-12 months',
          actionItems: [
            'Maintain consistent business operations',
            'Keep detailed business records',
            'File regular tax returns',
            'Build vendor relationships'
          ],
          resources: []
        })
      }
    }

    if (scores.financial < 70) {
      if (!data.financials.hasBusinessBankAccount) {
        recommendations.push({
          id: 'open-business-bank-account',
          category: 'Financial',
          title: 'Open Business Bank Account',
          description: 'Separate business and personal finances with a dedicated business bank account.',
          priority: 'critical',
          impact: 20,
          effort: 'easy',
          timeframe: '1 week',
          actionItems: [
            'Choose a business-friendly bank',
            'Gather required documentation',
            'Open checking and savings accounts',
            'Set up online banking'
          ],
          resources: []
        })
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.impact - a.impact
    })
  }

  private generateNextSteps(recommendations: Recommendation[]): string[] {
    const criticalRecs = recommendations.filter(r => r.priority === 'critical')
    const highRecs = recommendations.filter(r => r.priority === 'high')

    const steps: string[] = []

    if (criticalRecs.length > 0) {
      steps.push(`Address ${criticalRecs.length} critical issue(s) immediately`)
      steps.push(`Focus on: ${criticalRecs.slice(0, 2).map(r => r.title).join(', ')}`)
    }

    if (highRecs.length > 0) {
      steps.push(`Plan for ${highRecs.length} high-priority improvement(s)`)
    }

    steps.push('Schedule monthly progress reviews')
    steps.push('Track score improvements over time')

    return steps
  }
}

export const aiAssessmentEngine = new AIAssessmentEngine()
