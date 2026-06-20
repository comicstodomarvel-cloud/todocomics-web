'use client'

import { useEffect, useState, useCallback } from 'react'
import ImageWithFallback from '@/components/ImageWithFallback'
import Link from 'next/link'
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'

interface ReporteItem {
  contenido_id: string
  titulo: string
  url_portada: string
  link_descarga: string
  estado: string
  reportes: Array<{
    id: string
    session_id: string
    comentario: string
    estado: string
    fecha: string
  }>
}

export default function AdminReportesPage() {
  const [items, setItems] = useState<ReporteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const fetchItems = useCallback(async (key: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/reportes?key=${key}`)
      if (!res.ok) {
        setError('No autorizado — clave inválida')
        return
      }
      setItems(await res.json())
    } catch {
      setError('Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key') || ''
    setAdminKey(key)
    if (key) fetchItems(key)
    else setLoading(false)
  }, [fetchItems])

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyInput.trim()) return
    setAdminKey(keyInput)
    window.history.replaceState(null, '', `/admin/reportes?key=${keyInput}`)
    fetchItems(keyInput)
  }

  async function updateEstado(contenidoId: string, estado: string) {
    setUpdating(contenidoId)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ contenidoId, estado, action: 'admin_update' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(`Error ${res.status}: ${data.error || 'desconocido'}`)
      } else {
        if (estado === 'resuelto' || estado === 'falso') {
          setItems((prev) => prev.filter((i) => i.contenido_id !== contenidoId))
          setActionSuccess(`✅ Eliminado de la lista (${estado})`)
        } else {
          setItems((prev) =>
            prev.map((i) =>
              i.contenido_id === contenidoId ? { ...i, estado } : i
            )
          )
          setActionSuccess(`✅ Estado cambiado a "${estado}"`)
        }
      }
    } catch (e: unknown) {
      setActionError('Error de red — revisa la consola')
      console.error('updateEstado error:', e)
    } finally {
      setUpdating(null)
    }
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
        <form onSubmit={handleKeySubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Admin — Reportes</h1>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Clave de administrador"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
          >
            Ingresar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin?key=${adminKey}`} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">← Volver al panel</Link>
        <h1 className="text-2xl font-bold">📋 Reportes de Links Caídos</h1>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400 mb-6">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border border-green-800 bg-green-950/30 px-4 py-3 text-sm text-green-400 mb-6">
          {actionSuccess}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">Cargando...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-zinc-500">No hay reportes</p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.contenido_id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:p-6"
            >
              <div className="flex gap-4 mb-4">
                <div className="relative w-16 shrink-0">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-800">
                    <ImageWithFallback
                      src={item.url_portada}
                      alt={item.titulo}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white truncate">{item.titulo}</h2>
                  <a
                    href={item.link_descarga}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-amber-400 truncate block"
                  >
                    {item.link_descarga}
                  </a>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.estado === 'verificado'
                        ? 'bg-red-500/20 text-red-400'
                        : item.estado === 'resuelto'
                        ? 'bg-green-500/20 text-green-400'
                        : item.estado === 'falso'
                        ? 'bg-zinc-500/20 text-zinc-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {item.estado}
                  </span>
                  <span className="text-xs text-zinc-500 ml-3">
                    {item.reportes.length} reporte{item.reportes.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {item.reportes.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400"
                  >
                    <span className="text-zinc-500">{new Date(r.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    {r.comentario && <span className="ml-2 text-zinc-300">&quot;{r.comentario}&quot;</span>}
                  </div>
                ))}
                {item.reportes.length > 5 && (
                  <p className="text-[10px] text-zinc-600">+{item.reportes.length - 5} reportes más</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.estado !== 'verificado' && (
                  <button
                    onClick={() => updateEstado(item.contenido_id, 'verificado')}
                    disabled={updating === item.contenido_id}
                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-40"
                  >
                    <CheckCircle size={12} />
                    Verificar caído
                  </button>
                )}
                {item.estado !== 'resuelto' && (
                  <button
                    onClick={() => updateEstado(item.contenido_id, 'resuelto')}
                    disabled={updating === item.contenido_id}
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-40"
                  >
                    <RotateCcw size={12} />
                    Resuelto
                  </button>
                )}
                {item.estado !== 'falso' && (
                  <button
                    onClick={() => updateEstado(item.contenido_id, 'falso')}
                    disabled={updating === item.contenido_id}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                  >
                    <XCircle size={12} />
                    Falso positivo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
