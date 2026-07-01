'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface PostIssue {
  id: string
  titulo: string | null
  descripcion: string | null
  url_portada: string | null
  link_descarga: string | null
  categoria: string | null
  hashtags: string[] | null
  fecha_creacion: string | null
  campos_vacios: string[]
  portada_valida: boolean | null
}

interface RevisionData {
  total: number
  con_issues: number
  sin_titulo: PostIssue[]
  sin_descripcion: PostIssue[]
  sin_portada: PostIssue[]
  portada_rota: PostIssue[]
  sin_link: PostIssue[]
  todos: PostIssue[]
}

type Filtro = 'todos' | 'sin_portada' | 'portada_rota' | 'sin_link' | 'sin_descripcion' | 'sin_titulo'

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'sin_portada', label: 'Sin portada' },
  { id: 'portada_rota', label: 'Portada rota' },
  { id: 'sin_link', label: 'Sin link' },
  { id: 'sin_descripcion', label: 'Sin descripción' },
  { id: 'sin_titulo', label: 'Sin título' },
]

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('session_id', sid)
  }
  return sid
}

const EMPTY_IMG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="120" viewBox="0 0 80 120"><rect width="80" height="120" fill="#27272a"/><text x="40" y="60" text-anchor="middle" fill="#52525b" font-size="10">Sin</text><text x="40" y="73" text-anchor="middle" fill="#52525b" font-size="10">portada</text></svg>'
  )

export default function AdminRevisarPage() {
  const [data, setData] = useState<RevisionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState<string | null>(null)
  const [resultados, setResultados] = useState<Record<string, { ok: boolean; msg: string }>>({})
  const [imgsFallback, setImgsFallback] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contenido/revisar', { credentials: 'include' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Error ${res.status}`)
      }
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const postsFiltrados = data
    ? filtro === 'todos'
      ? data.todos
      : filtro === 'sin_portada'
        ? data.sin_portada
        : filtro === 'portada_rota'
          ? data.portada_rota
          : filtro === 'sin_link'
            ? data.sin_link
            : filtro === 'sin_descripcion'
              ? data.sin_descripcion
              : data.sin_titulo
    : []

  function initEdit(post: PostIssue) {
    setEditandoId(post.id)
    setEditForm({
      titulo: post.titulo ?? '',
      descripcion: post.descripcion ?? '',
      link_descarga: post.link_descarga ?? '',
      url_portada: post.url_portada ?? '',
      hashtag: post.hashtags?.[0] ?? '',
    })
  }

  async function handleSave(postId: string) {
    setGuardando(postId)
    setResultados((prev) => ({ ...prev, [postId]: { ok: true, msg: 'Guardando...' } }))

    const body: Record<string, string> = {}
    if (editForm.titulo) body.titulo = editForm.titulo
    if (editForm.descripcion) body.descripcion = editForm.descripcion
    if (editForm.link_descarga) body.link_descarga = editForm.link_descarga
    if (editForm.url_portada) body.url_portada = editForm.url_portada
    if (editForm.hashtag) body.hashtag = editForm.hashtag

    try {
      const res = await fetch(`/api/contenido/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const dataRes = await res.json()
      if (!res.ok) {
        setResultados((prev) => ({
          ...prev,
          [postId]: { ok: false, msg: dataRes.error || 'Error al guardar' },
        }))
      } else {
        setResultados((prev) => ({
          ...prev,
          [postId]: { ok: true, msg: '✅ Guardado' },
        }))
        setEditandoId(null)
        fetchData()
      }
    } catch {
      setResultados((prev) => ({
        ...prev,
        [postId]: { ok: false, msg: 'Error de red' },
      }))
    } finally {
      setGuardando(null)
    }
  }

  function imgSrc(url: string | null): string {
    if (!url) return EMPTY_IMG
    if (imgsFallback.has(url)) return EMPTY_IMG
    return url
  }

  function hasError(postId: string, campo: string): boolean {
    if (editandoId === postId) return true
    return data?.todos.find((p) => p.id === postId)?.campos_vacios.includes(campo) ?? false
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
          >
            ← Admin
          </Link>
          <h1 className="text-2xl font-bold text-white">🔍 Revisar contenido</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 text-sm text-red-400">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-zinc-400">
                  <strong className="text-zinc-200">{data.con_issues}</strong> de{' '}
                  <strong className="text-zinc-200">{data.total}</strong> posts tienen errores
                </span>
                <span className="text-xs text-zinc-600">|</span>
                <span className="text-xs text-zinc-500">
                  🖼 {data.sin_portada.length + data.portada_rota.length} portada
                  {data.sin_portada.length + data.portada_rota.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">
                  🔗 {data.sin_link.length} link
                  {data.sin_link.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">
                  📄 {data.sin_descripcion.length} descripción
                  {data.sin_descripcion.length !== 1 ? 'es' : ''}
                </span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">
                  ✏️ {data.sin_titulo.length} título
                  {data.sin_titulo.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    filtro === f.id
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {f.label}
                  {data &&
                    (f.id === 'todos'
                      ? ` (${data.todos.length})`
                      : f.id === 'sin_portada'
                        ? ` (${data.sin_portada.length})`
                        : f.id === 'portada_rota'
                          ? ` (${data.portada_rota.length})`
                          : f.id === 'sin_link'
                            ? ` (${data.sin_link.length})`
                            : f.id === 'sin_descripcion'
                              ? ` (${data.sin_descripcion.length})`
                              : ` (${data.sin_titulo.length})`)}
                </button>
              ))}
            </div>

            {postsFiltrados.length === 0 ? (
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-8 text-center">
                <p className="text-zinc-500 text-sm">No hay posts con errores en esta categoría 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {postsFiltrados.map((post) => {
                  const editando = editandoId === post.id
                  return (
                    <div
                      key={post.id}
                      className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 md:p-5"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="shrink-0">
                          <img
                            src={imgSrc(post.url_portada)}
                            alt={post.titulo ?? 'Portada'}
                            className="w-20 h-[120px] rounded-lg object-cover border border-zinc-700/50"
                            onError={() =>
                              setImgsFallback((prev) => new Set(prev).add(post.url_portada!))
                            }
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex flex-wrap gap-1.5">
                              {post.campos_vacios.map((campo) => (
                                <span
                                  key={campo}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20"
                                >
                                  {campo === 'url_portada' ? '🖼 sin portada' : campo === 'link_descarga' ? '🔗 sin link' : campo === 'descripcion' ? '📄 sin descripción' : '✏️ sin título'}
                                </span>
                              ))}
                              {post.portada_valida === false && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                                  🖼 portada rota
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-600 shrink-0">
                              {post.categoria ?? '—'}
                            </span>
                          </div>

                          {editando ? (
                            <div className="space-y-2">
                              {hasError(post.id, 'titulo') && (
                                <div>
                                  <label className="text-[10px] text-zinc-500 block mb-0.5">Título</label>
                                  <input
                                    type="text"
                                    value={editForm.titulo}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({ ...prev, titulo: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
                                    placeholder="Título del post"
                                  />
                                </div>
                              )}
                              {hasError(post.id, 'descripcion') && (
                                <div>
                                  <label className="text-[10px] text-zinc-500 block mb-0.5">Descripción</label>
                                  <textarea
                                    value={editForm.descripcion}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({ ...prev, descripcion: e.target.value }))
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-amber-500 resize-y text-zinc-100 placeholder-zinc-500"
                                    placeholder="Descripción del post"
                                  />
                                </div>
                              )}
                              {hasError(post.id, 'link_descarga') && (
                                <div>
                                  <label className="text-[10px] text-zinc-500 block mb-0.5">Link de descarga</label>
                                  <input
                                    type="text"
                                    value={editForm.link_descarga}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({ ...prev, link_descarga: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
                                    placeholder="https://bit.ly/..."
                                  />
                                </div>
                              )}
                              {hasError(post.id, 'url_portada') && (
                                <div>
                                  <label className="text-[10px] text-zinc-500 block mb-0.5">URL de portada</label>
                                  <input
                                    type="text"
                                    value={editForm.url_portada}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({ ...prev, url_portada: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
                                    placeholder="https://i.imgur.com/..."
                                  />
                                  {editForm.url_portada && (
                                    <img
                                      src={editForm.url_portada}
                                      alt="Preview"
                                      className="mt-2 w-16 h-24 rounded object-cover border border-zinc-700/50"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={() => handleSave(post.id)}
                                  disabled={guardando === post.id}
                                  className="rounded-md bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {guardando === post.id ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditandoId(null)
                                    setResultados((prev) => {
                                      const next = { ...prev }
                                      delete next[post.id]
                                      return next
                                    })
                                  }}
                                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                  Cancelar
                                </button>
                                {resultados[post.id] && (
                                  <span
                                    className={`text-xs ${
                                      resultados[post.id].ok ? 'text-green-400' : 'text-red-400'
                                    }`}
                                  >
                                    {resultados[post.id].msg}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-0.5">
                                <p className="text-sm text-zinc-200 truncate">
                                  {post.titulo || (
                                    <span className="text-zinc-600 italic">Sin título</span>
                                  )}
                                </p>
                                <p className="text-xs text-zinc-500 line-clamp-2">
                                  {post.descripcion || (
                                    <span className="text-zinc-600 italic">Sin descripción</span>
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => initEdit(post)}
                                  className="rounded-md bg-zinc-800 px-3 py-1 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                                >
                                  ✏️ Corregir
                                </button>
                                <Link
                                  href={`/admin/editar?id=${post.id}`}
                                  className="rounded-md bg-zinc-800 px-3 py-1 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                                >
                                  Editar completo →
                                </Link>
                                {resultados[post.id]?.ok && (
                                  <span className="text-xs text-green-400">{resultados[post.id].msg}</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
