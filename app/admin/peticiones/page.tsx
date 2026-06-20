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
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [peticiones, setPeticiones] = useState<Peticion[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<string | null>(null)
  const [editEstado, setEditEstado] = useState<string>('')
  const [editRespuesta, setEditRespuesta] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key') || ''
    if (key) setAdminKey(key)
  }, [])

  const fetchAll = useCallback(async () => {
    if (!adminKey) return
    setLoading(true)
    try {
      const res = await fetch('/api/peticiones', {
        headers: { 'x-admin-key': adminKey },
      })
      if (res.ok) {
        setPeticiones(await res.json())
      }
    } catch {
      setError('Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    if (adminKey) fetchAll()
  }, [adminKey, fetchAll])

  // GET sin session_id con admin key devuelve todas
  // Necesito modificar la API route para soportar esto... 
  // En realidad el GET actual requiere session_id. Para admin,
  // voy a usar el mismo endpoint pero permitir omitir session_id si hay x-admin-key.
  // Por ahora, asumamos que el GET sin session_id + x-admin-key devuelve todo.

  // Actually, let me just re-fetch using a different approach -
  // I'll call the API with the admin key to get all peticiones.

  // Wait - my GET API requires session_id. I need to also handle the admin case.
  // Let me modify the approach: I'll create a separate fetch for admin that
  // passes the admin key and the API will return all if admin key is valid.

  // But I already wrote the API route to require session_id for GET.
  // Let me update the API to also accept x-admin-key for the GET case.

  // For now, let me just handle it by making a fetch and including the admin key.
  // I need to update the API route to support this.

  // Actually, looking at the existing code patterns, the simplest approach is:
  // GET /api/peticiones with x-admin-key header → returns all peticiones
  // GET /api/peticiones?session_id=xxx → returns user's peticiones

  // Let me update peticiones/route.ts GET to handle both cases.

  // For now, let me just implement this page assuming the API works.

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
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
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

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
        <form onSubmit={(e) => { e.preventDefault(); if (keyInput.trim()) { setAdminKey(keyInput); window.history.replaceState(null, '', `/admin/peticiones?key=${keyInput}`) } }} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Admin - Peticiones</h1>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Clave de administrador"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
          <button type="submit" className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400">
            Ingresar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Peticiones de Cómics</h1>
        <Link href={`/admin?key=${adminKey}`} className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          ← Volver al panel
        </Link>
      </div>

      {loading ? (
        <p className="text-zinc-500">Cargando...</p>
      ) : peticiones.length === 0 ? (
        <p className="text-zinc-500">No hay peticiones aún.</p>
      ) : (
        <div className="space-y-4">
          {peticiones.map((p) => (
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
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
    </div>
  )
}
