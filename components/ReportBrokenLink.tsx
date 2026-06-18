'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Send, CheckCircle } from 'lucide-react'

export default function ReportBrokenLink({ contenidoId }: { contenidoId: string }) {
  const [expanded, setExpanded] = useState(false)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const key = `reported_link_${contenidoId}`
    if (localStorage.getItem(key)) setDone(true)
  }, [contenidoId])

  async function handleSubmit() {
    const sid = localStorage.getItem('session_id')
    if (!sid) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sid,
        },
        body: JSON.stringify({ contenidoId, comentario: comentario.trim() }),
      })

      if (res.ok) {
        localStorage.setItem(`reported_link_${contenidoId}`, '1')
        setDone(true)
        setExpanded(false)
      } else if (res.status === 409) {
        localStorage.setItem(`reported_link_${contenidoId}`, '1')
        setDone(true)
        setExpanded(false)
      } else {
        const data = await res.json()
        setError(data.error || 'Error al reportar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-green-700 bg-green-950/30 px-4 py-2 text-xs text-green-400">
        <CheckCircle size={14} />
        Reporte enviado
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
      >
        <AlertTriangle size={14} />
        Reportar link caído
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4">
          <p className="text-xs text-zinc-400 mb-3">
            ¿El link de descarga no funciona? Ayúdanos a revisarlo.
          </p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentario opcional (max 200 caracteres)"
            maxLength={200}
            rows={2}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none mb-3"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              {submitting ? 'Enviando...' : 'Enviar reporte'}
            </button>
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
