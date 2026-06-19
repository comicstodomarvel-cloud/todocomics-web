'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabaseBrowser } from './supabase-browser'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  perfil: { nickname: string; avatar_url: string } | null
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, nickname: string) => Promise<string | null>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshPerfil: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  perfil: null,
  signIn: async () => null,
  signUp: async () => null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshPerfil: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState<{ nickname: string; avatar_url: string } | null>(null)

  const refreshPerfil = useCallback(async () => {
    if (!user) {
      setPerfil(null)
      return
    }
    const { data } = await supabaseBrowser
      .from('perfiles')
      .select('nickname, avatar_url')
      .eq('id', user.id)
      .single()
    setPerfil(data ?? null)
  }, [user])

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) refreshPerfil()
    else setPerfil(null)
  }, [user, refreshPerfil])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signUp = async (email: string, password: string, nickname: string): Promise<string | null> => {
    const { error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
        emailRedirectTo: window.location.origin,
      },
    })
    return error?.message ?? null
  }

  const signInWithGoogle = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    setPerfil(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, perfil, signIn, signUp, signInWithGoogle, signOut, refreshPerfil }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
