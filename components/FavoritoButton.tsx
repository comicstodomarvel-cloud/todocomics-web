'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('session_id', sid)
  }
  return sid
}

export default function FavoritoButton({ contenidoId }: { contenidoId: string }) {
  const { session } = useAuth()
  const [favorito, setFavorito] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const sessionId = getSessionId()
    const headers: Record<string, string> = {}
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

    fetch(`/api/favoritos?session_id=${sessionId}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        const ids = (data.favoritos ?? []).map((f: { contenido_id: string }) => f.contenido_id)
        setFavorito(ids.includes(contenidoId))
      })
      .catch(() => {})
  }, [contenidoId, session])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    const sessionId = getSessionId()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

    try {
      const res = await fetch('/api/favoritos', {
        method: 'POST',
        headers,
        body: JSON.stringify({ contenido_id: contenidoId, session_id: sessionId }),
      })
      const data = await res.json()
      setFavorito(data.favorito)
    } catch (e) {
      console.error('Error toggling favorite:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`absolute top-10 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
        favorito
          ? 'bg-red-500 text-white shadow-md'
          : 'bg-black/50 text-zinc-300 hover:bg-zinc-800'
      }`}
      aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Heart size={14} fill={favorito ? 'currentColor' : 'none'} />
    </button>
  )
}
