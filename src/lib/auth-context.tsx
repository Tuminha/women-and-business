'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Create a browser-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create browser client
const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// User profile from our users table
interface UserProfile {
  id: number
  auth_id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: 'admin' | 'user'
  profile_image: string | null
  created_at: string
  last_login: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createBrowserClient())
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from our users table
  const fetchProfile = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile | null
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }

  // Create or update user profile when they sign in
  const upsertProfile = async (authUser: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single()

      if (existingProfile) {
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('auth_id', authUser.id)
      } else {
        // Create new profile
        const nameParts = authUser.user_metadata?.full_name?.split(' ') || []
        const firstName = nameParts[0] || authUser.email?.split('@')[0] || ''
        const lastName = nameParts.slice(1).join(' ') || null

        await supabase.from('users').insert({
          auth_id: authUser.id,
          email: authUser.email!,
          password_hash: '', // OAuth users don't have a password
          first_name: firstName,
          last_name: lastName,
          role: 'user',
          profile_image: authUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
      }

      // Fetch and return the profile
      return await fetchProfile(authUser.id)
    } catch (err) {
      console.error('Error upserting profile:', err)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          const userProfile = await fetchProfile(initialSession.user.id)
          setProfile(userProfile)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          if (event === 'SIGNED_IN') {
            // Upsert profile on sign in
            const userProfile = await upsertProfile(newSession.user)
            setProfile(userProfile)
          } else {
            const userProfile = await fetchProfile(newSession.user.id)
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const nameParts = name.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          first_name: firstName,
          last_name: lastName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
