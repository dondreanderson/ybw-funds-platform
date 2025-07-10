import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
  keyGenerator?: (req: NextRequest) => string
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Authentication endpoints - strict limits
  '/api/auth': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes
  
  // Assessment endpoints - moderate limits
  '/api/assessment': { windowMs: 5 * 60 * 1000, max: 10 }, // 10 requests per 5 minutes
  '/api/fundability': { windowMs: 5 * 60 * 1000, max: 10 },
  
  // Marketplace endpoints - higher limits
  '/api/marketplace': { windowMs: 60 * 1000, max: 30 }, // 30 requests per minute
  
  // Profile endpoints - moderate limits
  '/api/profile': { windowMs: 60 * 1000, max: 20 }, // 20 requests per minute
  
  // Default rate limit
  default: { windowMs: 60 * 1000, max: 100 } // 100 requests per minute
}

export async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname
  
  // Find matching rate limit config
  const configKey = Object.keys(rateLimitConfigs).find(key => 
    key !== 'default' && pathname.startsWith(key)
  ) || 'default'
  
  const config = rateLimitConfigs[configKey]
  
  // Generate rate limit key
  const key = generateRateLimitKey(req, pathname)
  
  // Check rate limit
  const isAllowed = await checkRateLimit(key, config)
  
  if (!isAllowed) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        retryAfter: Math.ceil(config.windowMs / 1000) 
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(config.windowMs / 1000).toString()
        }
      }
    )
  }
  
  return null // Allow request to continue
}

function generateRateLimitKey(req: NextRequest, pathname: string): string {
  // Use IP address and user agent for anonymous requests
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  
  // For authenticated requests, we could also use user ID
  return `rate_limit:${pathname}:${ip}:${userAgent.slice(0, 50)}`
}

async function checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // Get current count from database or cache
    // For now, we'll use a simple database approach
    // In production, consider using Redis for better performance
    
    const windowStart = new Date(Date.now() - config.windowMs)
    
    // Count requests in current window
    const { count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', key)
      .gte('timestamp', windowStart.toISOString())
    
    // Log this request
    await supabase
      .from('audit_logs')
      .insert({
        session_id: key,
        table_name: 'rate_limit',
        operation: 'REQUEST',
        new_values: { endpoint: key },
        timestamp: new Date().toISOString()
      })
    
    return (count || 0) < config.max
  } catch (error) {
    console.error('Rate limiting error:', error)
    // On error, allow request (fail open)
    return true
  }
}
