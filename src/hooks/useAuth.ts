'use client'

import { useEffect, useState } from 'react'
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session and user data
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Get user profile from your users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (userData && !error) {
            setUser(userData)
          } else {
            console.log('No user profile found:', error)
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.email,
              fundability_score: 0
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            // Get user profile from your users table
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single()

            if (userData && !error) {
              setUser(userData)
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.email,
                fundability_score: 0
              })
            }
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  return {
    user,
    loading,
    signOut,
    signIn
  }
}
