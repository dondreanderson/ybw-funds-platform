import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function authMiddleware(req: NextRequest): Promise<{
  isAuthenticated: boolean
  user?: any
  response?: NextResponse
}> {
  try {
    const supabase = createClient()
    
    // Get user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return {
        isAuthenticated: false,
        response: new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    // Log authentication for audit
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'auth',
        operation: 'AUTHENTICATE',
        ip_address: req.ip || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      })
    
    return {
      isAuthenticated: true,
      user
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      isAuthenticated: false,
      response: new NextResponse(
        JSON.stringify({ error: 'Authentication error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (req: NextRequest) => {
    const { isAuthenticated, user, response } = await authMiddleware(req)
    
    if (!isAuthenticated) {
      return response
    }
    
    // Check role-based access if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user?.user_metadata?.role || 'user'
      
      if (!allowedRoles.includes(userRole)) {
        return new NextResponse(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    return null // Allow request to continue
  }
}
