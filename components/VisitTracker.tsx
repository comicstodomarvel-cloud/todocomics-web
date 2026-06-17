'use client'

import { useEffect } from 'react'

export default function VisitTracker({ contenidoId }: { contenidoId: string }) {
  useEffect(() => {
    const key = `visited_${contenidoId}`
    if (sessionStorage.getItem(key)) return

    sessionStorage.setItem(key, '1')

    fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenidoId }),
    }).catch(() => {})
  }, [contenidoId])

  return null
}
