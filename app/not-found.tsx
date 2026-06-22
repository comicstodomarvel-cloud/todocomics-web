'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function NotFound() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const path = window.location.pathname + window.location.search
    fetch('/api/monitoreo/report-404', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    }).catch(() => {})
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4">
      <span className="text-6xl font-bold text-zinc-700">404</span>
      <p className="text-lg text-zinc-400">Contenido no encontrado</p>
      <p className="max-w-md text-center text-sm text-zinc-600">
        El elemento que buscas no existe o ha sido eliminado del catálogo.
      </p>
      <Link
        href="/"
        className="rounded-md bg-amber-500 px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
      >
        Volver al catálogo
      </Link>
    </div>
  )
}
