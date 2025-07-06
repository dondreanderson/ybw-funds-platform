import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '../types/common';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface Session {
  user: {
    id: string;
    email?: string;
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  const [mounted, setMounted] = useState(false);

  // Track if component is mounted to prevent state updates on unmounted components
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Helper function to safely fetch user profile
  const fetchUserProfile = async (email: string, userId: string): Promise<User | null> => {
    try {
      // First, try to get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }

      // Create user object with available data
      const userData: User = {
        id: userId,
        email: email,
        name: profile?.name || email.split('@')[0],
        profile: profile || undefined
      };

      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        id: userId,
        email: email,
        name: email.split('@')[0]
      };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        }
        return { success: false, error: error.message };
      }

      if (data.user && mounted) {
        const userEmail = data.user.email || email; // Fallback to provided email
        const userData = await fetchUserProfile(userEmail, data.user.id);
        
        if (mounted) {
          setAuthState({
            user: userData,
            loading: false,
            error: null
          });
        }
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || 'Sign in failed';
      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      return { success: false, error: errorMessage };
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      if (mounted) {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setAuthState({
              user: null,
              loading: false,
              error: error.message
            });
          }
          return;
        }

        if (session?.user && mounted) {
          // Safe email handling - provide fallback if email is undefined
          const userEmail = session.user.email;
          const userId = session.user.id;
          
          if (userEmail) {
            // Only fetch profile if email is available
            const userData = await fetchUserProfile(userEmail, userId);
            if (mounted) {
              setAuthState({
                user: userData,
                loading: false,
                error: null
              });
            }
          } else {
            // Handle case where email is not available
            const fallbackUser: User = {
              id: userId,
              email: 'unknown@example.com',
              name: 'User'
            };
            
            if (mounted) {
              setAuthState({
                user: fallbackUser,
                loading: false,
                error: null
              });
            }
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              loading: false,
              error: null
            });
          }
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState({
            user: null,
            loading: false,
            error: error?.message || 'Authentication failed'
          });
        }
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const userEmail = session.user.email;
            const userId = session.user.id;
            
            if (userEmail) {
              const userData = await fetchUserProfile(userEmail, userId);
              if (mounted) {
                setAuthState({
                  user: userData,
                  loading: false,
                  error: null
                });
              }
            } else {
              // Handle case where email is not available
              const fallbackUser: User = {
                id: userId,
                email: 'unknown@example.com',
                name: 'User'
              };
              
              if (mounted) {
                setAuthState({
                  user: fallbackUser,
                  loading: false,
                  error: null
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              setAuthState({
                user: null,
                loading: false,
                error: null
              });
            }
          }
        } catch (error: any) {
          console.error('Auth state change error:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false, error: error?.message }));
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [mounted]);

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        }
        return { success: false, error: error.message };
      }

      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || 'Sign up failed';
      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        }
        return { success: false, error: error.message };
      }

      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || 'Password reset failed';
      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signOut,
    signUp,
    resetPassword
  };
};

export default useAuth;
