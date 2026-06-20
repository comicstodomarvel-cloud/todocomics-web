'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('session_id', sid)
  }
  return sid
}

export default function LikeButton({ contenidoId }: { contenidoId: string }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchStatus = useCallback(async () => {
    const sessionId = getSessionId()
    try {
      const res = await fetch(`/api/likes?contenidoId=${contenidoId}&session_id=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      }
    } catch {
      /* silencio */
    }
  }, [contenidoId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    const sessionId = getSessionId()

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido_id: contenidoId, session_id: sessionId }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      }
    } catch {
      /* silencio */
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`absolute top-11 right-2 z-10 flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-all duration-200 ${
        liked
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-black/50 text-zinc-300 hover:bg-zinc-800'
      }`}
      aria-label={liked ? 'Quitar like' : 'Dar like'}
    >
      <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
      <span className={`text-[11px] font-semibold tabular-nums ${liked ? 'text-red-400' : 'text-zinc-400'}`}>
        {count}
      </span>
    </button>
  )
}
