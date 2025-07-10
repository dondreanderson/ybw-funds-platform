import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Common validation schemas
export const schemas = {
  // Assessment validation
  fundabilityAssessment: z.object({
    business_name: z.string().min(1).max(255),
    criteria: z.record(z.any()),
    user_id: z.string().uuid().optional()
  }),
  
  // Profile validation
  userProfile: z.object({
    full_name: z.string().min(1).max(255).optional(),
    company_name: z.string().min(1).max(255).optional(),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
    business_type: z.string().max(100).optional(),
    industry: z.string().max(100).optional(),
    years_in_business: z.number().int().min(0).optional(),
    annual_revenue: z.number().positive().optional(),
    employee_count: z.number().int().min(0).optional()
  }),
  
  // Marketplace listing validation
  marketplaceListing: z.object({
    listing_type: z.enum(['funding_request', 'lender_offer', 'service_provider']),
    title: z.string().min(1).max(255),
    description: z.string().min(10).max(5000),
    funding_amount: z.number().positive().optional(),
    funding_type: z.string().max(100).optional(),
    interest_rate: z.number().min(0).max(100).optional(),
    term_length: z.number().int().min(1).optional()
  })
}

export async function validateInput(
  req: NextRequest,
  schemaName: keyof typeof schemas
): Promise<{ isValid: boolean; data?: any; errors?: string[] }> {
  try {
    const body = await req.json()
    const schema = schemas[schemaName]
    
    const result = schema.safeParse(body)
    
    if (result.success) {
      return { isValid: true, data: result.data }
    } else {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      return { isValid: false, errors }
    }
  } catch (error) {
    return { isValid: false, errors: ['Invalid JSON format'] }
  }
}

export function createValidationResponse(errors: string[]): NextResponse {
  return new NextResponse(
    JSON.stringify({ 
      error: 'Validation failed', 
      details: errors 
    }),
    { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
