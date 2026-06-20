'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Pencil, Trash2, Check, ThumbsUp, ThumbsDown, User } from 'lucide-react'

interface Comment {
  id: string
  contenido_id: string
  nickname: string
  contenido: string
  fecha: string
  likes: number
  dislikes: number
  miVoto: 'like' | 'dislike' | null
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

export default function CommentSection({ contenidoId }: { contenidoId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [nickname, setNickname] = useState('')
  const [contenido, setContenido] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'edit' | 'delete' } | null>(null)
  const [confirmNickname, setConfirmNickname] = useState('')
  const [editText, setEditText] = useState('')
  const [voting, setVoting] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('comment_nickname')
    if (saved) setNickname(saved)
  }, [])

  const fetchComments = useCallback(async () => {
    try {
      const sessionId = getSessionId()
      const res = await fetch(`/api/comentarios?contenidoId=${contenidoId}`, {
        headers: sessionId ? { 'x-session-id': sessionId } : undefined,
      })
      if (res.ok) {
        setComments(await res.json())
      }
    } catch {
      // silencio
    } finally {
      setLoading(false)
    }
  }, [contenidoId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim() || !contenido.trim() || contenido.length > 300) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenidoId,
          nickname: nickname.trim(),
          contenido: contenido.trim(),
        }),
      })

      if (res.ok) {
        localStorage.setItem('comment_nickname', nickname.trim())
        setContenido('')
        await fetchComments()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al enviar comentario')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVote(comentarioId: string, tipo: 'like' | 'dislike') {
    const sessionId = getSessionId()
    if (!sessionId) return

    setVoting(comentarioId)
    setError('')

    try {
      const res = await fetch('/api/comentarios/votos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ comentarioId, tipo }),
      })

      if (res.ok) {
        const data = await res.json()
        setComments((prev) =>
          prev.map((c) =>
            c.id === comentarioId
              ? { ...c, likes: data.likes, dislikes: data.dislikes, miVoto: data.miVoto }
              : c
          )
        )
      } else {
        const data = await res.json()
        setError(data.error || 'Error al votar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setVoting(null)
    }
  }

  function startEdit(comment: Comment) {
    setActionTarget({ id: comment.id, action: 'edit' })
    setConfirmNickname('')
    setEditText(comment.contenido)
    setError('')
  }

  function startDelete(comment: Comment) {
    setActionTarget({ id: comment.id, action: 'delete' })
    setConfirmNickname('')
    setEditText('')
    setError('')
  }

  async function confirmAction() {
    if (!actionTarget) return
    const { id, action } = actionTarget

    if (action === 'edit') {
      if (!editText.trim() || editText.length > 300) return
      try {
        const res = await fetch(`/api/comentarios?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: confirmNickname, contenido: editText.trim() }),
        })
        if (res.ok) {
          await fetchComments()
          setActionTarget(null)
          setEditText('')
        } else {
          const data = await res.json()
          setError(data.error || 'Error al editar')
        }
      } catch {
        setError('Error de conexión')
      }
    } else {
      try {
        const res = await fetch(`/api/comentarios?id=${id}`, {
          method: 'DELETE',
          headers: { 'x-nickname': confirmNickname },
        })
        if (res.ok) {
          await fetchComments()
          setActionTarget(null)
        } else {
          const data = await res.json()
          setError(data.error || 'Error al eliminar')
        }
      } catch {
        setError('Error de conexión')
      }
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Ahora'
    if (diffMin < 60) return `Hace ${diffMin} min`
    const diffHrs = Math.floor(diffMin / 60)
    if (diffHrs < 24) return `Hace ${diffHrs}h`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="border-t border-zinc-800 mt-12 pt-8">
      <h3 className="text-lg font-bold text-white mb-6">
        Comentarios {comments.length > 0 && `(${comments.length})`}
      </h3>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Tu nickname"
            maxLength={50}
            required
            className="w-full max-w-[180px] rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <span className="text-[11px] text-zinc-500 shrink-0">
            {contenido.length}/300
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
            <User size={16} className="text-zinc-500" />
          </div>

          <div className="relative flex-1">
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe un comentario..."
              maxLength={300}
              required
              rows={2}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 pr-11 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !nickname.trim() || !contenido.trim()}
              className="absolute bottom-2 right-2 rounded-md p-1.5 text-zinc-400 transition-all duration-200 hover:bg-amber-500/20 hover:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400"
              aria-label="Enviar comentario"
            >
              <Send
                size={16}
                className={`transition-transform duration-200 ${submitting ? 'animate-pulse' : ''}`}
              />
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2 pl-12 text-xs text-red-400">{error}</p>
        )}
      </form>

      {loading ? (
        <div className="text-sm text-zinc-500">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-500">Sé el primero en comentar</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-500">
                    {comment.nickname}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {formatDate(comment.fecha)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(comment)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label="Editar comentario"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => startDelete(comment)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    aria-label="Eliminar comentario"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
                {comment.contenido}
              </p>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => handleVote(comment.id, 'like')}
                  disabled={voting === comment.id}
                  className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-40 ${
                    comment.miVoto === 'like'
                      ? 'text-amber-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ThumbsUp size={14} />
                  {comment.likes}
                </button>
                <button
                  onClick={() => handleVote(comment.id, 'dislike')}
                  disabled={voting === comment.id}
                  className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-40 ${
                    comment.miVoto === 'dislike'
                      ? 'text-red-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ThumbsDown size={14} />
                  {comment.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            <h4 className="text-sm font-bold text-white mb-2">
              {actionTarget.action === 'edit' ? 'Editar comentario' : 'Eliminar comentario'}
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              Ingresa tu nickname para confirmar la {actionTarget.action === 'edit' ? 'edición' : 'eliminación'}
            </p>
            {actionTarget.action === 'edit' && (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none mb-3"
              />
            )}
            <input
              type="text"
              value={confirmNickname}
              onChange={(e) => setConfirmNickname(e.target.value)}
              placeholder="Tu nickname"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setActionTarget(null); setError('') }}
                className="rounded-md border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={!confirmNickname.trim() || (actionTarget.action === 'edit' && !editText.trim())}
                className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={14} />
                Confirmar
              </button>
            </div>
            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
