'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Check } from 'lucide-react'

interface FaqItem {
  id: string
  pregunta: string
  respuesta: string
  orden: number
}

export default function AdminFaqPage() {
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')

  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPregunta, setEditPregunta] = useState('')
  const [editRespuesta, setEditRespuesta] = useState('')

  const [creando, setCreando] = useState(false)
  const [nuevaPregunta, setNuevaPregunta] = useState('')
  const [nuevaRespuesta, setNuevaRespuesta] = useState('')

  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key') || ''
    if (key) setAdminKey(key)
  }, [])

  useEffect(() => {
    if (!adminKey) return
    cargarFaq()
  }, [adminKey])

  async function cargarFaq() {
    setLoading(true)
    try {
      const res = await fetch('/api/faq')
      const data = await res.json()
      setItems(data)
    } catch {
      setResultado({ ok: false, msg: 'Error al cargar FAQ' })
    } finally {
      setLoading(false)
    }
  }

  const guardarEdicion = useCallback(async (id: string) => {
    if (!editPregunta.trim() || !editRespuesta.trim()) {
      setResultado({ ok: false, msg: 'La pregunta y respuesta no pueden estar vacías' })
      return
    }

    try {
      const res = await fetch(`/api/faq/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          pregunta: editPregunta.trim(),
          respuesta: editRespuesta.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setResultado({ ok: false, msg: `Error: ${data.error}` })
        return
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, pregunta: editPregunta.trim(), respuesta: editRespuesta.trim() }
            : item
        )
      )
      setEditingId(null)
      setResultado({ ok: true, msg: '✅ Pregunta actualizada' })
    } catch {
      setResultado({ ok: false, msg: 'Error de red' })
    }
  }, [editPregunta, editRespuesta, adminKey])

  const eliminar = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return

    try {
      const res = await fetch(`/api/faq/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      })

      if (!res.ok) {
        const data = await res.json()
        setResultado({ ok: false, msg: `Error: ${data.error}` })
        return
      }

      setItems((prev) => prev.filter((item) => item.id !== id))
      setResultado({ ok: true, msg: '🗑️ Pregunta eliminada' })
    } catch {
      setResultado({ ok: false, msg: 'Error de red' })
    }
  }, [adminKey])

  const reordenar = useCallback(async (id: string, nuevoOrden: number) => {
    try {
      await fetch(`/api/faq/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ orden: nuevoOrden }),
      })
      await cargarFaq()
    } catch {
      setResultado({ ok: false, msg: 'Error al reordenar' })
    }
  }, [adminKey])

  const crear = useCallback(async () => {
    if (!nuevaPregunta.trim() || !nuevaRespuesta.trim()) {
      setResultado({ ok: false, msg: 'Completá todos los campos' })
      return
    }

    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          pregunta: nuevaPregunta.trim(),
          respuesta: nuevaRespuesta.trim(),
          orden: items.length + 1,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setResultado({ ok: false, msg: `Error: ${data.error}` })
        return
      }

      setNuevaPregunta('')
      setNuevaRespuesta('')
      setCreando(false)
      setResultado({ ok: true, msg: '✅ Pregunta creada' })
      await cargarFaq()
    } catch {
      setResultado({ ok: false, msg: 'Error de red' })
    }
  }, [nuevaPregunta, nuevaRespuesta, adminKey, items.length])

  function iniciarEdicion(item: FaqItem) {
    setEditingId(item.id)
    setEditPregunta(item.pregunta)
    setEditRespuesta(item.respuesta)
  }

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyInput.trim()) return
    setAdminKey(keyInput)
    window.history.replaceState(null, '', `/admin/faq?key=${keyInput}`)
  }

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
        <form onSubmit={handleKeySubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Admin — FAQ</h1>
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin?key=${adminKey}`} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">← Volver al panel</Link>
            <h1 className="text-2xl font-bold text-white">Gestionar FAQ</h1>
          </div>
          <button
            onClick={() => setCreando(!creando)}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            <Plus size={18} />
            {creando ? 'Cancelar' : 'Nueva pregunta'}
          </button>
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
            <button
              onClick={() => setResultado(null)}
              className="float-right text-zinc-500 hover:text-zinc-300"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {creando && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
            <h2 className="font-bold text-white">Nueva pregunta</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Pregunta</label>
              <input
                type="text"
                value={nuevaPregunta}
                onChange={(e) => setNuevaPregunta(e.target.value)}
                placeholder="¿Cuál es la pregunta?"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Respuesta</label>
              <textarea
                value={nuevaRespuesta}
                onChange={(e) => setNuevaRespuesta(e.target.value)}
                rows={4}
                placeholder="Escribí la respuesta. Podés usar HTML básico: &lt;strong&gt; para negrita, &lt;br&gt; para saltos de línea."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500 resize-y"
              />
            </div>
            <button
              onClick={crear}
              className="rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
            >
              Crear pregunta
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 animate-pulse">
                <div className="h-5 bg-zinc-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>No hay preguntas. Creá la primera usando el botón de arriba.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
              >
                {editingId === item.id ? (
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Pregunta</label>
                      <input
                        type="text"
                        value={editPregunta}
                        onChange={(e) => setEditPregunta(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">Respuesta</label>
                      <textarea
                        value={editRespuesta}
                        onChange={(e) => setEditRespuesta(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 resize-y"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => guardarEdicion(item.id)}
                        className="flex items-center gap-1.5 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
                      >
                        <Check size={16} />
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-zinc-500 font-mono shrink-0">
                            #{item.orden}
                          </span>
                          <h3 className="font-semibold text-zinc-100 text-sm leading-relaxed line-clamp-2">
                            {item.pregunta}
                          </h3>
                        </div>
                        <p className="text-zinc-500 text-xs line-clamp-2 mt-1">
                          {item.respuesta.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => reordenar(item.id, item.orden - 1)}
                          disabled={index === 0}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => reordenar(item.id, item.orden + 1)}
                          disabled={index === items.length - 1}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={() => iniciarEdicion(item)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => eliminar(item.id)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
