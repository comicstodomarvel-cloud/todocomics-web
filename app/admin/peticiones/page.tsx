'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Peticion {
  id: string
  session_id: string
  editorial: string
  nombre_comic: string
  numero_volumen: string | null
  link_portada: string
  comentarios: string | null
  estado: 'pendiente' | 'publicado' | 'no_disponible'
  respuesta_admin: string | null
  fecha_creacion: string
}

const ESTADOS = ['pendiente', 'publicado', 'no_disponible'] as const

export default function AdminPeticionesPage() {
  const [peticiones, setPeticiones] = useState<Peticion[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<string | null>(null)
  const [editEstado, setEditEstado] = useState<string>('')
  const [editRespuesta, setEditRespuesta] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'pendientes' | 'resueltas'>('pendientes')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/peticiones', {
        credentials: 'include',
      })
      if (res.ok) {
        setPeticiones(await res.json())
      }
    } catch {
      setError('Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function startEdit(p: Peticion) {
    setEditando(p.id)
    setEditEstado(p.estado)
    setEditRespuesta(p.respuesta_admin || '')
    setError('')
    setSuccess('')
  }

  async function saveEdit() {
    if (!editando) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/peticiones/${editando}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          estado: editEstado,
          respuesta_admin: editRespuesta.trim() || null,
        }),
      })
      if (res.ok) {
        setSuccess('Guardado')
        setEditando(null)
        fetchAll()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al guardar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }



  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
            ← Volver al panel
          </Link>
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'pendientes'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Pendientes ({peticiones.filter((p) => p.estado === 'pendiente').length})
            </button>
            <button
              onClick={() => setActiveTab('resueltas')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'resueltas'
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Resueltas ({peticiones.filter((p) => p.estado !== 'pendiente').length})
            </button>
          </div>
        </div>
        <h1 className="text-2xl font-bold shrink-0">Peticiones</h1>
      </div>

      {loading ? (
        <p className="text-zinc-500">Cargando...</p>
      ) : (
        (() => {
          const filtered = peticiones.filter((p) =>
            activeTab === 'pendientes' ? p.estado === 'pendiente' : p.estado !== 'pendiente'
          )
          if (filtered.length === 0) {
            return (
              <p className="text-zinc-500">
                {activeTab === 'pendientes' ? 'No hay peticiones pendientes.' : 'No hay peticiones resueltas.'}
              </p>
            )
          }
          return (
            <div className="space-y-4">
              {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{p.nombre_comic}</h3>
                  <p className="text-xs text-zinc-500">
                    {p.editorial}
                    {p.numero_volumen && ` · Vol. ${p.numero_volumen}`}
                    {' · '}
                    {new Date(p.fecha_creacion).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {editando !== p.id && (
                  <button
                    onClick={() => startEdit(p)}
                    className="shrink-0 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>

              {p.link_portada && (
                <a href={p.link_portada} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-500 hover:text-amber-400 break-all block mb-2">
                  {p.link_portada}
                </a>
              )}

              {p.comentarios && (
                <p className="text-sm text-zinc-400 mb-2 italic">&ldquo;{p.comentarios}&rdquo;</p>
              )}

              {editando === p.id ? (
                <div className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Estado</label>
                    <select
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value)}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
                    >
                      <option value="pendiente">🟠 Pendiente</option>
                      <option value="publicado">🟢 Publicado</option>
                      <option value="no_disponible">🔴 No disponible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Respuesta al usuario</label>
                    <textarea
                      value={editRespuesta}
                      onChange={(e) => setEditRespuesta(e.target.value)}
                      placeholder="Ej: Lo agregamos al catálogo, pronto estará disponible..."
                      rows={2}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditando(null)}
                      className="rounded-md border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-800 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    p.estado === 'publicado' ? 'bg-green-500/20 text-green-400' :
                    p.estado === 'no_disponible' ? 'bg-red-500/20 text-red-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {p.estado === 'publicado' ? 'PUBLICADO' :
                     p.estado === 'no_disponible' ? 'NO DISPONIBLE' : 'EN PROCESO'}
                  </span>
                  <span className="text-[11px] text-zinc-600">ID: {p.id.slice(0, 8)}...</span>
                </div>
              )}

              {p.respuesta_admin && editando !== p.id && (
                <p className="mt-2 text-sm text-zinc-400 italic border-l-2 border-zinc-700 pl-3">
                  {p.respuesta_admin}
                </p>
              )}
            </div>
          ))}
        </div>
      )
        })()
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
    </div>
  )
}
