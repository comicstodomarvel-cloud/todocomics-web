'use client'

import { useState, useEffect, useCallback } from 'react'

interface VoteData {
  promedio: number | null
  total: number
  miVoto: number | null
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('session_id', sid)
  }
  return sid
}

export default function RatingWidget({ contenidoId }: { contenidoId: string }) {
  const [voteData, setVoteData] = useState<VoteData>({ promedio: null, total: 0, miVoto: null })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchVotes = useCallback(async () => {
    setLoading(true)
    try {
      const sessionId = getSessionId()
      const res = await fetch(`/api/votos?contenidoId=${contenidoId}`, {
        headers: { 'x-session-id': sessionId },
      })
      if (res.ok) {
        const data = await res.json()
        setVoteData(data)
      }
    } catch {
      // silencio
    } finally {
      setLoading(false)
    }
  }, [contenidoId])

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  async function handleVote(valor: number) {
    if (submitting || voteData.miVoto !== null) return

    setSubmitting(true)
    setError('')

    try {
      const sessionId = getSessionId()
      const res = await fetch('/api/votos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ contenidoId, valor }),
      })

      if (res.status === 409) {
        setError('Ya votaste este contenido')
      } else if (!res.ok) {
        setError('Error al votar')
      } else {
        await fetchVotes()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  const { promedio, total, miVoto } = voteData

  return (
    <div className="border-t border-zinc-800 mt-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        {promedio !== null && total > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">
              {'🔥'.repeat(Math.round(promedio))}
            </span>
            <span className="text-sm font-semibold text-zinc-100">
              {promedio}
            </span>
            <span className="text-xs text-zinc-500">
              ({total} {total === 1 ? 'voto' : 'votos'})
            </span>
          </div>
        ) : (
          <span className="text-xs text-zinc-500">Sé el primero en votar</span>
        )}

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const isActive = miVoto !== null && n <= (miVoto ?? 0)
            const isMine = miVoto === n
            return (
              <button
                key={n}
                onClick={() => handleVote(n)}
                disabled={miVoto !== null || submitting}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-lg transition-all duration-150 ${
                  isMine
                    ? 'bg-amber-500/20 scale-110'
                    : miVoto !== null || submitting
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-zinc-800 hover:scale-110 active:scale-95 cursor-pointer'
                }`}
                aria-label={`Votar ${n} de 5`}
              >
                🔥
              </button>
            )
          })}
        </div>
      </div>

      {miVoto !== null && (
        <p className="text-xs text-amber-500 mt-2">
          Votaste {miVoto} {miVoto === 1 ? '🔥' : '🔥'.repeat(miVoto)}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}
