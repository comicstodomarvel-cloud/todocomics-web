'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageWithFallback from '@/components/ImageWithFallback'

interface PostData {
  id: string
  titulo: string
  descripcion: string
  url_portada: string
  categoria: string
  fecha_creacion: string
}

export default function AdminEliminarPage() {
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')

  const [postUrl, setPostUrl] = useState('')
  const [cargando, setCargando] = useState(false)
  const [postData, setPostData] = useState<PostData | null>(null)
  const [error, setError] = useState('')
  const [noEncontrado, setNoEncontrado] = useState(false)

  const [eliminando, setEliminando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  const [portadaStorage, setPortadaStorage] = useState(false)
  const [portadaCompartida, setPortadaCompartida] = useState(false)
  const [portadaCount, setPortadaCount] = useState(0)
  const [eliminarPortadaChecked, setEliminarPortadaChecked] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key') || ''
    if (key) setAdminKey(key)
  }, [])

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyInput.trim()) return
    setAdminKey(keyInput)
    window.history.replaceState(null, '', `/admin/eliminar?key=${keyInput}`)
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
    setPortadaStorage(false)
    setPortadaCompartida(false)
    setPortadaCount(0)
    setEliminarPortadaChecked(false)

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

      const esPortadaStorage =
        data.url_portada &&
        data.url_portada.includes('supabase.co/storage/v1/object/public/portadas/')

      if (esPortadaStorage) {
        setPortadaStorage(true)
        const checkRes = await fetch(`/api/contenido/check-portada?url=${encodeURIComponent(data.url_portada)}`)
        if (checkRes.ok) {
          const check = await checkRes.json()
          setPortadaCompartida(check.count > 0)
          setPortadaCount(check.count)
        }
      }
    } catch {
      setError('Error de red — revisa la consola')
    } finally {
      setCargando(false)
    }
  }

  async function handleEliminar() {
    if (!postData) return

    if (!window.confirm(`¿Estás seguro de eliminar "${postData.titulo}"?\n\nEsta acción no se puede deshacer.`)) return

    setEliminando(true)
    setResultado(null)

    try {
      const params = new URLSearchParams()
      if (eliminarPortadaChecked) params.set('eliminar_portada', 'true')

      const res = await fetch(`/api/contenido/${postData.id}?${params.toString()}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      })

      const data = await res.json()

      if (!res.ok) {
        setResultado({ ok: false, msg: `Error ${res.status}: ${data.error || 'desconocido'}` })
        return
      }

      let msg = 'Post eliminado correctamente'
      if (data.portada?.eliminada) {
        msg += '. La imagen de portada también fue eliminada del almacenamiento.'
      } else if (data.portada?.presente && data.portada?.compartida && !data.portada?.eliminada) {
        msg += '. La imagen de portada no se eliminó porque la usan otros posts.'
      } else if (data.portada?.presente && !data.portada?.eliminada) {
        msg += '. La imagen de portada no se eliminó del almacenamiento.'
      }

      setResultado({ ok: true, msg })
      setPostData(null)
      setPostUrl('')
      setPortadaStorage(false)
      setPortadaCompartida(false)
      setPortadaCount(0)
      setEliminarPortadaChecked(false)
    } catch {
      setResultado({ ok: false, msg: 'Error de red — revisa la consola' })
    } finally {
      setEliminando(false)
    }
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
        <form onSubmit={handleKeySubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Admin — Eliminar post</h1>
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
        <h1 className="text-2xl font-bold text-white">Eliminar post</h1>
      </div>

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

        {resultado && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              resultado.ok
                ? 'border-green-800 bg-green-950/30 text-green-400'
                : 'border-red-800 bg-red-950/30 text-red-400'
            }`}
          >
            {resultado.ok && '✅ '}
            {resultado.msg}
          </div>
        )}

        {postData && (
          <>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Post a eliminar</p>
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

            <div className="flex gap-6 items-start">
              {postData.url_portada && (
                <div className="relative w-24 aspect-[2/3] shrink-0 overflow-hidden rounded-md bg-zinc-800">
                  <ImageWithFallback
                    src={postData.url_portada}
                    alt="Portada"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white mb-1">{postData.titulo}</h2>
                <p className="text-sm text-zinc-400 line-clamp-3">{postData.descripcion}</p>
              </div>
            </div>

            {portadaStorage && portadaCompartida && (
              <div className="rounded-lg border border-amber-800 bg-amber-950/30 px-4 py-3 space-y-3">
                <p className="text-sm text-amber-400">
                  ⚠️ Esta imagen de portada también la usan otros <strong>{portadaCount}</strong> post(s).
                  Si la eliminas del almacenamiento, dejará de verse en esos posts.
                </p>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eliminarPortadaChecked}
                    onChange={(e) => setEliminarPortadaChecked(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Eliminar también la imagen del almacenamiento
                </label>
              </div>
            )}

            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {eliminando ? 'Eliminando...' : 'Eliminar post'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
