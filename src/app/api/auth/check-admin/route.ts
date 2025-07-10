import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({
        isAuthenticated: false,
        isAdmin: false,
        user: null
      })
    }
    
    // Check if user has admin role
    const isAdmin = user.user_metadata?.role === 'admin'
    
    return NextResponse.json({
      isAuthenticated: true,
      isAdmin,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      }
    })

  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      user: null
    })
  }
}
