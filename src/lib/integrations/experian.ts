interface CreditReportRequest {
  firstName: string
  lastName: string
  ssn: string
  dateOfBirth: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}

interface BusinessCreditReport {
  businessName: string
  ein: string
  creditScore: number
  creditRating: string
  paymentHistory: {
    onTimePayments: number
    latePayments: number
    averageDaysLate: number
  }
  creditUtilization: number
  publicRecords: any[]
  tradeLines: any[]
  inquiries: any[]
  riskFactors: string[]
  recommendations: string[]
}

export class ExperianService {
  private baseUrl = process.env.EXPERIAN_API_URL || 'https://sandbox-us-api.experian.com'
  private apiKey = process.env.EXPERIAN_API_KEY
  private clientSecret = process.env.EXPERIAN_CLIENT_SECRET

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.clientSecret}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      })

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('Error getting Experian access token:', error)
      throw new Error('Failed to authenticate with Experian')
    }
  }

  async getBusinessCreditReport(
    businessName: string,
    ein: string,
    address: any
  ): Promise<BusinessCreditReport> {
    try {
      const accessToken = await this.getAccessToken()

      const requestBody = {
        businessName,
        ein,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode
        },
        requestId: `ybw-${Date.now()}`
      }

      const response = await fetch(`${this.baseUrl}/businessinformation/businesses/v1/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Experian API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform Experian response to our format
      return this.transformExperianResponse(data)
    } catch (error) {
      console.error('Error fetching business credit report:', error)
      throw new Error('Failed to fetch business credit report')
    }
  }

  private transformExperianResponse(data: any): BusinessCreditReport {
    // This is a simplified transformation
    // In production, you'd handle the complex Experian response structure
    return {
      businessName: data.businessName || '',
      ein: data.ein || '',
      creditScore: data.creditScore || 0,
      creditRating: this.getCreditRating(data.creditScore || 0),
      paymentHistory: {
        onTimePayments: data.paymentHistory?.onTime || 0,
        latePayments: data.paymentHistory?.late || 0,
        averageDaysLate: data.paymentHistory?.averageDays || 0
      },
      creditUtilization: data.creditUtilization || 0,
      publicRecords: data.publicRecords || [],
      tradeLines: data.tradeLines || [],
      inquiries: data.inquiries || [],
      riskFactors: this.extractRiskFactors(data),
      recommendations: this.generateRecommendations(data)
    }
  }

  private getCreditRating(score: number): string {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 50) return 'Poor'
    return 'Very Poor'
  }

  private extractRiskFactors(data: any): string[] {
    const riskFactors: string[] = []
    
    if (data.creditScore < 60) {
      riskFactors.push('Low credit score')
    }
    
    if (data.paymentHistory?.late > 5) {
      riskFactors.push('History of late payments')
    }
    
    if (data.creditUtilization > 70) {
      riskFactors.push('High credit utilization')
    }
    
    if (data.publicRecords?.length > 0) {
      riskFactors.push('Public records found')
    }

    return riskFactors
  }

  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = []
    
    if (data.creditScore < 70) {
      recommendations.push('Focus on improving payment history')
      recommendations.push('Reduce credit utilization below 30%')
    }
    
    if (data.paymentHistory?.late > 0) {
      recommendations.push('Set up automatic payments to avoid late payments')
    }
    
    if (!data.tradeLines || data.tradeLines.length < 3) {
      recommendations.push('Establish more trade lines with suppliers')
    }

    return recommendations
  }

  // Simplified credit monitoring
  async monitorCreditChanges(ein: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()
      
      // This would implement Experian's credit monitoring API
      const response = await fetch(`${this.baseUrl}/businessinformation/businesses/v1/monitor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ein,
          alertTypes: ['creditScoreChange', 'newInquiry', 'publicRecord']
        })
      })

      return await response.json()
    } catch (error) {
      console.error('Error setting up credit monitoring:', error)
      throw new Error('Failed to set up credit monitoring')
    }
  }
}

export const experianService = new ExperianService()
