'use client'

import { useEffect, useState } from 'react'
import ImageWithFallback from '@/components/ImageWithFallback'

interface PostData {
  id: string
  titulo: string
  descripcion: string
  url_portada: string
  categoria: string
  hashtags: string[]
  link_descarga: string
  fecha_creacion: string
}

export default function AdminEditarPage() {
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')

  const [postUrl, setPostUrl] = useState('')
  const [cargando, setCargando] = useState(false)
  const [postData, setPostData] = useState<PostData | null>(null)
  const [error, setError] = useState('')
  const [noEncontrado, setNoEncontrado] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [linkDescarga, setLinkDescarga] = useState('')
  const [urlPortada, setUrlPortada] = useState('')
  const [hashtag, setHashtag] = useState('')

  const [guardando, setGuardando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key') || ''
    if (key) setAdminKey(key)
  }, [])

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyInput.trim()) return
    setAdminKey(keyInput)
    window.history.replaceState(null, '', `/admin/editar?key=${keyInput}`)
  }

  function extraerId(input: string): string | null {
    const trimmed = input.trim()
    if (!trimmed) return null

    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    const match = trimmed.match(uuidRegex)
    return match ? match[0] : null
  }

  async function handleCargar() {
    const id = extraerId(postUrl)
    if (!id) {
      setError('No se pudo extraer un ID válido del link')
      return
    }

    setCargando(true)
    setError('')
    setNoEncontrado(false)
    setPostData(null)
    setResultado(null)

    try {
      const res = await fetch(`/api/contenido/${id}`)
      if (res.status === 404) {
        setNoEncontrado(true)
        return
      }
      if (!res.ok) {
        setError(`Error ${res.status} al cargar el post`)
        return
      }

      const data: PostData = await res.json()
      setPostData(data)
      setTitulo(data.titulo)
      setDescripcion(data.descripcion)
      setLinkDescarga(data.link_descarga)
      setUrlPortada(data.url_portada)
      setHashtag(data.hashtags?.[0] || '')
    } catch {
      setError('Error de red — revisa la consola')
    } finally {
      setCargando(false)
    }
  }

  async function handleGuardar() {
    if (!postData) return
    if (!titulo.trim()) {
      setResultado({ ok: false, msg: 'El título no puede estar vacío' })
      return
    }

    setGuardando(true)
    setResultado(null)

    try {
      const body: Record<string, string> = {}
      if (titulo !== postData.titulo) body.titulo = titulo
      if (descripcion !== postData.descripcion) body.descripcion = descripcion
      if (linkDescarga !== postData.link_descarga) body.link_descarga = linkDescarga
      if (urlPortada !== postData.url_portada) body.url_portada = urlPortada
      const hashtagActual = postData.hashtags?.[0] || ''
      if (hashtag !== hashtagActual) body.hashtag = hashtag

      if (Object.keys(body).length === 0) {
        setResultado({ ok: false, msg: 'No hay cambios para guardar' })
        setGuardando(false)
        return
      }

      const res = await fetch(`/api/contenido/${postData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setResultado({ ok: false, msg: `Error ${res.status}: ${data.error || 'desconocido'}` })
      } else {
        const finalUrlPortada = data.url_portada_final || body.url_portada || urlPortada
        setPostData((prev) => prev ? { ...prev, ...body, url_portada: finalUrlPortada } : prev)
        if (finalUrlPortada) setUrlPortada(finalUrlPortada)
        setResultado({ ok: true, msg: '✅ Post actualizado correctamente' })
      }
    } catch (e: unknown) {
      setResultado({ ok: false, msg: 'Error de red — revisa la consola' })
      console.error('Edit error:', e)
    } finally {
      setGuardando(false)
    }
  }

  function huboCambios(): boolean {
    if (!postData) return false
    return (
      titulo !== postData.titulo ||
      descripcion !== postData.descripcion ||
      linkDescarga !== postData.link_descarga ||
      urlPortada !== postData.url_portada ||
      hashtag !== (postData.hashtags?.[0] || '')
    )
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
        <form onSubmit={handleKeySubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Admin — Editar post</h1>
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
      <h1 className="text-2xl font-bold mb-8 text-white">Editar post existente</h1>

      <div className="max-w-3xl space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">
            Link del post o UUID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={postUrl}
              onChange={(e) => {
                setPostUrl(e.target.value)
                setError('')
                setNoEncontrado(false)
                setResultado(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCargar()
              }}
              placeholder="https://todocomics.com/item/uuid-del-post"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
            />
            <button
              onClick={handleCargar}
              disabled={cargando || !postUrl.trim()}
              className="rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {cargando ? 'Cargando...' : 'Cargar'}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Pega el link completo del post (ej: https://todocomics.com/item/abc-123) o solo el UUID
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {noEncontrado && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            No se encontró ningún post con ese ID
          </div>
        )}

        {postData && (
          <>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Post actual</p>
              <p className="text-xs text-zinc-500">
                ID: <span className="text-zinc-400 font-mono">{postData.id}</span>
                {' — '}
                Categoría: <span className="text-zinc-400">{postData.categoria}</span>
                {' — '}
                Creado: {new Date(postData.fecha_creacion).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-500 resize-y text-zinc-100 placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">#hashtag</label>
              <input
                type="text"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                placeholder="#Manga, #Comic..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                La categoría se actualiza automáticamente según el hashtag
              </p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Link de descarga</label>
              <input
                type="url"
                value={linkDescarga}
                onChange={(e) => setLinkDescarga(e.target.value)}
                placeholder="https://bit.ly/..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">URL de portada</label>
              <input
                type="url"
                value={urlPortada}
                onChange={(e) => setUrlPortada(e.target.value)}
                placeholder="https://i.imgur.com/..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Si es una URL nueva, se descargará y subirá automáticamente al servidor
              </p>
              {urlPortada && (
                <div className="relative mt-3 w-32 aspect-[2/3] overflow-hidden rounded-md bg-zinc-800">
                  <ImageWithFallback
                    src={urlPortada}
                    alt="Preview portada"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              )}
            </div>

            {resultado && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  resultado.ok
                    ? 'border-green-800 bg-green-950/30 text-green-400'
                    : 'border-red-800 bg-red-950/30 text-red-400'
                }`}
              >
                {resultado.msg}
              </div>
            )}

            <button
              onClick={handleGuardar}
              disabled={guardando || !huboCambios()}
              className="rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
