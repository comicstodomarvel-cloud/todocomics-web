'use client'

import Link from 'next/link'
import { useState, useCallback, useRef } from 'react'

export default function AdminImportarPage() {
  const [textoPost, setTextoPost] = useState('')
  const [hashtag, setHashtag] = useState('')
  const [linkDescarga, setLinkDescarga] = useState('')
  const [urlPortada, setUrlPortada] = useState('')

  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  const [tituloParseado, setTituloParseado] = useState('')
  const [descripcionParseada, setDescripcionParseada] = useState('')
  const [duplicados, setDuplicados] = useState<Array<{ id: string; titulo: string; fecha_creacion: string }>>([])
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const parsearTexto = useCallback((texto: string) => {
    const lineas = texto.split('\n')
    const primeraLinea = lineas.find((l) => l.trim().length > 0)

    if (!primeraLinea) {
      setTituloParseado('')
      setDescripcionParseada('')
      setDuplicados([])
      return
    }

    const titulo = primeraLinea
      .replace(/:tick:|:white_check_mark:|:x:|:warning:|:(?:\w+):/g, '')
      .replace(/\s*\|\s*/g, ' │ ')
      .trim()

    const idxPrimerSalto = texto.indexOf('\n\n')
    let desc = ''
    if (idxPrimerSalto !== -1) {
      desc = texto.slice(idxPrimerSalto + 2).trim()
    }

    desc = desc
      .replace(/Imagen debes ignorar cualquier emoji\.?/gi, '')
      .replace(/:tick:|:white_check_mark:|:x:|:warning:|:(?:\w+):/g, '')
      .trim()

    setTituloParseado(titulo)
    setDescripcionParseada(desc)

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setDuplicados([])
    setCheckingDuplicate(true)

    fetch(`/api/contenido/check-duplicate?titulo=${encodeURIComponent(titulo)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setDuplicados(data.duplicados ?? [])
        setCheckingDuplicate(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDuplicados([])
          setCheckingDuplicate(false)
        }
      })
  }, [])

  async function enviarImportacion() {
    setLoading(true)
    setResultado(null)

    try {
      const res = await fetch('/api/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titulo: tituloParseado,
          descripcion: descripcionParseada,
          hashtag: hashtag.trim(),
          link_descarga: linkDescarga.trim(),
          url_portada: urlPortada.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResultado({ ok: false, msg: `Error ${res.status}: ${data.error || 'desconocido'}` })
      } else {
        setResultado({ ok: true, msg: `✅ Importado correctamente — ID: ${data.id}` })
        setTextoPost('')
        setHashtag('')
        setLinkDescarga('')
        setUrlPortada('')
        setTituloParseado('')
        setDescripcionParseada('')
        setDuplicados([])
      }
    } catch (e: unknown) {
      setResultado({ ok: false, msg: 'Error de red — revisa la consola' })
      console.error('Import error:', e)
    } finally {
      setLoading(false)
    }
  }

  function handleImportar() {
    if (!tituloParseado || !hashtag.trim()) {
      setResultado({ ok: false, msg: 'El título y el hashtag son obligatorios.' })
      return
    }

    if (duplicados.length > 0) {
      setShowConfirmModal(true)
    } else {
      enviarImportacion()
    }
  }

  function handleConfirmarDuplicado() {
    setShowConfirmModal(false)
    enviarImportacion()
  }



  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">← Volver al panel</Link>
        <h1 className="text-2xl font-bold text-white">Importar post manualmente</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">
            Pega el texto del post de Discord
          </label>
          <textarea
            value={textoPost}
            onChange={(e) => {
              setTextoPost(e.target.value)
              parsearTexto(e.target.value)
            }}
            rows={10}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-500 resize-y text-zinc-100 placeholder-zinc-500"
            placeholder="DEVILMAN: THE BIRTH | GO NAGAI/UMANOSUKE IIDA | OH! PRODUCTION/KODANSHA | JAPÓN | 1987 | [ESPAÑOL]"
          />
        </div>

        {tituloParseado && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 space-y-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Preview</p>
            <p className="text-sm text-amber-400 font-semibold">{tituloParseado}</p>
            <p className="text-xs text-zinc-400 line-clamp-3">{descripcionParseada}</p>

            {checkingDuplicate && (
              <p className="text-xs text-zinc-500 mt-2">Verificando duplicados...</p>
            )}

            {!checkingDuplicate && duplicados.length > 0 && (
              <div className="mt-2 rounded-md border border-red-800 bg-red-950/30 px-3 py-2">
                <p className="text-xs font-semibold text-red-400">
                  ⚠️ Este título ya existe en la web
                </p>
                {duplicados.map((d) => (
                  <p key={d.id} className="text-xs text-red-300/70 truncate mt-0.5">
                    {d.titulo}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">
            #hashtag <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            placeholder="#Manga, #DC, #StarWars, #libro..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            La categoría (Comic/Manga/Pelicula/Serie/Anime/Libro) se detecta automáticamente del hashtag
          </p>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">
            Link de descarga <span className="text-zinc-600">(opcional)</span>
          </label>
          <input
            type="url"
            value={linkDescarga}
            onChange={(e) => setLinkDescarga(e.target.value)}
            placeholder="https://bit.ly/..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">
            URL de portada <span className="text-zinc-600">(opcional)</span>
          </label>
          <input
            type="url"
            value={urlPortada}
            onChange={(e) => setUrlPortada(e.target.value)}
            placeholder="https://i.imgur.com/..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Se descargará y subirá automáticamente al servidor
          </p>
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
          onClick={handleImportar}
          disabled={loading || !tituloParseado || !hashtag.trim()}
          className="rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Importando...' : 'Importar'}
        </button>

        {/* Modal de confirmación para duplicados */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-950 text-lg">
                  ⚠️
                </span>
                <h3 className="text-lg font-bold text-white">Publicación duplicada</h3>
              </div>

              <p className="mb-3 text-sm text-zinc-300">
                Este título ya fue publicado anteriormente:
              </p>

              <ul className="mb-5 space-y-1.5">
                {duplicados.map((d) => (
                  <li key={d.id} className="rounded-md bg-zinc-800 px-3 py-2">
                    <p className="text-sm text-zinc-200 truncate">{d.titulo}</p>
                    <p className="text-[11px] text-zinc-500">
                      {new Date(d.fecha_creacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mb-5 text-sm text-zinc-400">
                ¿Aún así quieres importarlo?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmarDuplicado}
                  disabled={loading}
                  className="flex-1 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-40"
                >
                  {loading ? 'Importando...' : 'Sí, importar'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  className="flex-1 rounded-md border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-40"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
