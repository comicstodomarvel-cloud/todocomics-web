'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handled = useRef(false)

  const [supabaseClient] = useState(() => createClient(
    supabaseUrl, supabaseAnonKey,
    { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'todocomics-auth' } }
  ))

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const code = searchParams.get('code')

    if (code) {
      supabaseClient.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('[auth/callback] exchangeCodeForSession:', error.message)
          router.replace('/?confirmed=error')
          return
        }
        router.replace('/?confirmed=true')
      })
    } else {
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/')
        }
      })

      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          subscription.unsubscribe()
          router.replace('/')
        }
      })
    }
  }, [router, searchParams, supabaseClient])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <p className="text-zinc-400">Completando inicio de sesión...</p>
      </div>
    </div>
  )
}
