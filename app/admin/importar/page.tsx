'use client'

import { useState, useCallback, useEffect } from 'react'

export default function AdminImportarPage() {
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')

  const [textoPost, setTextoPost] = useState('')
  const [hashtag, setHashtag] = useState('')
  const [linkDescarga, setLinkDescarga] = useState('')
  const [urlPortada, setUrlPortada] = useState('')

  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  const [tituloParseado, setTituloParseado] = useState('')
  const [descripcionParseada, setDescripcionParseada] = useState('')

  const parsearTexto = useCallback((texto: string) => {
    const lineas = texto.split('\n')
    const primeraLinea = lineas.find((l) => l.trim().length > 0)

    if (!primeraLinea) {
      setTituloParseado('')
      setDescripcionParseada('')
      return
    }

    const titulo = primeraLinea.split('|')[0].trim()

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
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key') || ''
    if (key) setAdminKey(key)
  }, [])

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyInput.trim()) return
    setAdminKey(keyInput)
    window.history.replaceState(null, '', `/admin/importar?key=${keyInput}`)
  }

  async function handleImportar() {
    if (!tituloParseado || !hashtag.trim()) {
      setResultado({ ok: false, msg: 'El título y el hashtag son obligatorios.' })
      return
    }

    setLoading(true)
    setResultado(null)

    try {
      const res = await fetch('/api/importar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
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
      }
    } catch (e: unknown) {
      setResultado({ ok: false, msg: 'Error de red — revisa la consola' })
      console.error('Import error:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
        <form onSubmit={handleKeySubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Admin — Importar</h1>
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
      <h1 className="text-2xl font-bold mb-8 text-white">
        Importar post manualmente
      </h1>

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
            La categoría (Comic/Manga/Pelicula/Serie/Libro) se detecta automáticamente del hashtag
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
      </div>
    </div>
  )
}
