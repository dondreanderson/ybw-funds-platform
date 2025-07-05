'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  name?: string
  business_name?: string
  fundability_score?: number
  business_phone?: string
  business_website?: string
  business_ein?: string
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const createFallbackUser = useCallback((authUser: any): User => {
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      fundability_score: 0
    }
  }, [])

  const fetchUserProfile = useCallback(async (email: string, authUserId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userData && !error) {
        return userData
      } else {
        console.log('No user profile found, creating fallback:', error?.message)
        return createFallbackUser({ id: authUserId, email })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return createFallbackUser({ id: authUserId, email })
    }
  }, [createFallbackUser])

  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    try {
      if (session?.user) {
        const userData = await fetchUserProfile(session.user.email, session.user.id)
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error in auth state change:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [fetchUserProfile])

  useEffect(() => {
    let mounted = true

    // Get initial session and user data
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          const userData = await fetchUserProfile(session.user.email, session.user.id)
          if (mounted) {
            setUser(userData)
          }
        } else if (mounted) {
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    // Cleanup function
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, handleAuthStateChange])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        return { error }
      }
      setUser(null)
      return { error: null }
    } catch (error) {
      console.error('Error in signOut:', error)
      return { error }
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Sign in error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in signIn:', error)
      return { data: null, error }
    }
  }, [])

  return {
    user,
    loading,
    signOut,
    signIn
  }
}