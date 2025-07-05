export class AssessmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AssessmentError'
  }
}

export class ValidationError extends AssessmentError {
  constructor(message: string, public field?: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends AssessmentError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

export const ErrorHandler = {
  // Handle API errors
  handleApiError(error: any) {
    if (error.name === 'ValidationError') {
      return {
        status: 400,
        message: error.message,
        field: error.field
      }
    }
    
    if (error.name === 'DatabaseError') {
      return {
        status: 500,
        message: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      }
    }
    
    return {
      status: 500,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  },

  // Validate assessment data
  validateAssessmentData(data: any): { valid: boolean, errors: string[] } {
    const errors: string[] = []
    
    if (!data.userId) {
      errors.push('User ID is required')
    }
    
    if (!data.responses || !Array.isArray(data.responses)) {
      errors.push('Responses array is required')
    }
    
    if (data.responses?.length === 0) {
      errors.push('At least one response is required')
    }
    
    data.responses?.forEach((response: any, index: number) => {
      if (!response.criterionId) {
        errors.push(`Response ${index + 1}: criterion ID is required`)
      }
      
      if (response.responseValue === undefined || response.responseValue === null) {
        errors.push(`Response ${index + 1}: response value is required`)
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Sanitize user input
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim().slice(0, 1000) // Limit length
    }
    
    if (typeof input === 'number') {
      return Math.max(0, Math.min(input, 10000)) // Reasonable bounds
    }
    
    if (typeof input === 'boolean') {
      return Boolean(input)
    }
    
    return input
  },

  // Log errors appropriately
  logError(error: any, context?: string) {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Assessment Error:', errorInfo)
    } else {
      // In production, send to logging service
      // Example: sendToLoggingService(errorInfo)
    }
  }
}