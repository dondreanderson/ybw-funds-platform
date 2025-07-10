import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/signin')
  }
  
  const isAdmin = user.user_metadata?.role === 'admin'
  if (!isAdmin) {
    redirect('/dashboard') // Redirect non-admins to regular dashboard
  }
  
  return user
}

export async function checkAdminAccess() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return {
    isAuthenticated: !!user,
    isAdmin: user?.user_metadata?.role === 'admin',
    user
  }
}
