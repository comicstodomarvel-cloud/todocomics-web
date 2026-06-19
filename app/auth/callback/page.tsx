'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const code = searchParams.get('code')

    if (code) {
      // Email confirmation flow — exchange code for session
      supabaseBrowser.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('[auth/callback] exchangeCodeForSession:', error.message)
          router.replace('/?confirmed=error')
          return
        }
        router.replace('/?confirmed=true')
      })
    } else {
      // OAuth flow — the hash (#access_token=...) is automatically
      // processed by supabase-js. Wait for the session or SIGNED_IN event.
      supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/')
        }
      })

      const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          subscription.unsubscribe()
          router.replace('/')
        }
      })
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <p className="text-zinc-400">Completando inicio de sesión...</p>
      </div>
    </div>
  )
}
