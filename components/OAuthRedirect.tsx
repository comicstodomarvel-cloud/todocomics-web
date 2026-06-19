'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function OAuthRedirect() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/' && window.location.hash.includes('access_token')) {
      window.location.href = '/auth/callback' + window.location.hash
    }
  }, [pathname])

  return null
}
