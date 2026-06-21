'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Update } from '@/lib/types'

function limpiarDescripcion(descripcion: string | null): string {
  if (!descripcion) return ''
  return descripcion
    .replace(/LINK DIRECTO AL POST\s*\(?\s*https?:\/\/[^\s)]+\s*\)?/gi, '')
    .replace(/LINK DIRECTO\s*AL\s*POST/gi, '')
    .replace(/https?:\/\/t\.me\/[^\s)]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatDateRelative(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays}d`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const ICON_MAP: Record<string, string> = {
  volumen: '📚',
  correccion: '🔧',
  enlace_nuevo: '🔗',
  portada: '🖼️',
}

export default function UpdatesDropdownPanel({
  onClose,
}: {
  onClose: () => void
}) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUpdates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/updates/latest?limit=10')
      const data = await res.json()
      setUpdates(data.updates || [])
    } catch (err) {
      console.error('Error fetching updates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-3">
        <h3 className="font-bold text-lg">Últimas Actualizaciones</h3>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-zinc-800 h-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <p>No hay actualizaciones recientes</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {updates.map((update) => {
              const href = update.contenido_id
                ? `/item/${update.contenido_id}`
                : update.metadata?.link_post_original || '#'

              return (
                <Link
                  key={update.id}
                  href={href}
                  className="block p-4 hover:bg-zinc-800/50 transition-colors"
                  onClick={onClose}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {ICON_MAP[update.tipo] || '📢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-zinc-100 text-sm truncate">
                        {update.titulo}
                      </h4>
                      <p className="text-zinc-400 text-xs mt-1 line-clamp-2">
                        {limpiarDescripcion(update.descripcion)}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span>{formatDateRelative(update.fecha)}</span>
                        {update.contenido?.categoria && (
                          <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                            {update.contenido.categoria}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 p-3 bg-zinc-900/50">
        <Link
          href="/updates"
          className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-3 min-h-[44px] flex items-center justify-center rounded-lg transition-colors"
          onClick={onClose}
        >
          VER MÁS →
        </Link>
      </div>
    </div>
  )
}
