'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Check, Send, HelpCircle } from 'lucide-react'

interface Peticion {
  id: string
  editorial: string
  nombre_comic: string
  numero_volumen: string | null
  link_portada: string
  comentarios: string | null
  estado: 'pendiente' | 'publicado' | 'no_disponible'
  respuesta_admin: string | null
  fecha_creacion: string
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('session_id', sid)
  }
  return sid
}

const ESTADOS: Record<string, { label: string; class: string }> = {
  pendiente: { label: 'EN PROCESO', class: 'bg-orange-500/20 text-orange-400' },
  publicado: { label: 'PUBLICADO', class: 'bg-green-500/20 text-green-400' },
  no_disponible: { label: 'NO DISPONIBLE', class: 'bg-red-500/20 text-red-400' },
}

const STEPS = [
  { num: 1, title: 'Editorial', key: 'editorial' as const, placeholder: 'Ej: Marvel, DC, Image...' },
  { num: 2, title: 'Nombre del cómic', key: 'nombre_comic' as const, placeholder: 'Ej: The Amazing Spider-Man #1' },
  { num: 3, title: 'Número de volumen', key: 'numero_volumen' as const, placeholder: 'Ej: Vol. 3', optional: true },
  { num: 4, title: 'Link de la portada', key: 'link_portada' as const, placeholder: 'https://...' },
  { num: 5, title: 'Comentarios extras', key: 'comentarios' as const, placeholder: 'Instrucciones, aclaraciones...', optional: true },
]

export default function PeticionForm() {
  const [sessionId, setSessionId] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({ editorial: '', nombre_comic: '', numero_volumen: '', link_portada: '', comentarios: '' })
  const [submitting, setSubmitting] = useState(false)
  const [peticiones, setPeticiones] = useState<Peticion[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [faqAlert, setFaqAlert] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  const fetchPeticiones = useCallback(async () => {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/peticiones?session_id=${sessionId}`)
      if (res.ok) setPeticiones(await res.json())
    } catch { /* silencio */ }
  }, [sessionId])

  useEffect(() => {
    if (sessionId) fetchPeticiones()
  }, [sessionId, fetchPeticiones])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function updateField(key: string, value: string) {
    const next = { ...form, [key]: value }
    setForm(next)
    setError('')

    // Avanzar paso si el actual está completo
    if (key === 'editorial' && value.trim().length >= 2 && currentStep === 1) {
      setCurrentStep(2)
    }
    if (key === 'nombre_comic' && value.trim().length >= 2 && currentStep === 2) {
      setCurrentStep(3)
    }
    if (key === 'numero_volumen' && currentStep === 3) {
      setCurrentStep(4)
    }
    if (key === 'link_portada' && value.startsWith('https://') && currentStep === 4) {
      setCurrentStep(5)
    }
  }

  function skipVolume() {
    if (currentStep === 3) setCurrentStep(4)
  }

  function isStepValid(step: number): boolean {
    switch (step) {
      case 1: return form.editorial.trim().length >= 2
      case 2: return form.nombre_comic.trim().length >= 2
      case 3: return true // optional
      case 4: return form.link_portada.startsWith('https://')
      case 5: return true // optional
      default: return false
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.editorial.trim() || !form.nombre_comic.trim() || !form.link_portada.startsWith('https://')) return
    if (submitting) return

    if (totalPendientes >= 3) {
      setFaqAlert('Solo podés tener hasta 3 peticiones sin resolver al mismo tiempo. Esperá a que se libere un espacio para agregar una nueva.')
      setTimeout(() => setFaqAlert(null), 5000)
      setSubmitting(false)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/peticiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          editorial: form.editorial.trim(),
          nombre_comic: form.nombre_comic.trim(),
          numero_volumen: form.numero_volumen.trim() || null,
          link_portada: form.link_portada.trim(),
          comentarios: form.comentarios.trim() || null,
        }),
      })

      if (res.ok) {
        showToast('¡Gracias por tu petición! Haremos lo posible por ubicarlo pero no aseguramos encontrarlo.')
        setForm({ editorial: '', nombre_comic: '', numero_volumen: '', link_portada: '', comentarios: '' })
        setCurrentStep(1)
        fetchPeticiones()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al enviar la petición')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPendientes = peticiones.filter((p) => p.estado === 'pendiente').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Welcome */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Volver al catálogo
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Solicitar un Cómic</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          ¿No encontraste lo que buscabas? Completá el formulario y vamos a intentar agregarlo al catálogo.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1 mb-10 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${
              currentStep >= s.num
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-zinc-800 text-zinc-600'
            }`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                currentStep >= s.num ? 'bg-[#ff8c00] text-black' : 'bg-zinc-700 text-zinc-500'
              }`}>
                {currentStep > s.num ? <Check size={10} /> : s.num}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-zinc-700" />}
          </div>
        ))}
      </div>

      {/* Two columns on md+ */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">

        {/* Sidebar — hidden on mobile */}
        <aside className="hidden md:block md:w-[35%] shrink-0">
          <div className="sticky top-4 rounded-xl bg-[#121212] border border-zinc-800 p-6 space-y-6">
            {/* Guía y Reglas */}
            <div>
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-1.5">
                <HelpCircle size={14} />
                Guía y Reglas
              </h3>
              <ul className="space-y-3 text-xs text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-amber-500 shrink-0 font-bold">1.</span>
                  <span>Verificá que el cómic no exista ya en el catálogo antes de pedirlo.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500 shrink-0 font-bold">2.</span>
                  <span>Usá links de portadas válidos que comiencen con <code className="text-zinc-300">https://</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500 shrink-0 font-bold">3.</span>
                  <span>Si conocés el número de volumen, incluilo para ayudarnos a identificarlo mejor.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-500 shrink-0 font-bold">4.</span>
                  <span>Peticiones duplicadas o con datos incorrectos serán rechazadas.</span>
                </li>
              </ul>
            </div>

            {/* Tiempos de respuesta */}
            <div className="border-t border-zinc-800 pt-4">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Tiempos de Respuesta</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                El equipo revisa las peticiones periódicamente. El estado de tu solicitud
                se actualiza automáticamente en la sección de abajo.
              </p>
            </div>

            {/* Stats rápidas */}
            <div className="border-t border-zinc-800 pt-4">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Tus Peticiones</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">{peticiones.length}</span>
                <span className="text-xs text-zinc-500">total</span>
              </div>
              {totalPendientes > 0 && (
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-lg font-semibold text-orange-400">{totalPendientes}</span>
                  <span className="text-xs text-zinc-500">en proceso</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right column */}
        <div className="flex-1 min-w-0">
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
              <div className="space-y-6">
                {/* Step 1: Editorial */}
                <div className={`transition-all duration-300 ${currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                    ¿De qué editorial es el cómic que buscas?
                  </label>
                  <input
                    type="text"
                    value={form.editorial}
                    onChange={(e) => updateField('editorial', e.target.value)}
                    placeholder={STEPS[0].placeholder}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]/30 focus:ring-2 focus:shadow-sm"
                  />
                </div>

                {/* Step 2: Nombre */}
                <div className={`transition-all duration-300 ${currentStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                    ¿Cuál es el nombre del cómic?
                  </label>
                  <input
                    type="text"
                    value={form.nombre_comic}
                    onChange={(e) => updateField('nombre_comic', e.target.value)}
                    placeholder={STEPS[1].placeholder}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]/30 focus:ring-2 focus:shadow-sm"
                  />
                </div>

                {/* Step 3: Volumen (optional) */}
                <div className={`transition-all duration-300 ${currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                    En caso de saberlo, ¿cuál es el número de volumen?
                    <span className="text-zinc-500 font-normal ml-1">(opcional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.numero_volumen}
                      onChange={(e) => updateField('numero_volumen', e.target.value)}
                      placeholder={STEPS[2].placeholder}
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]/30 focus:ring-2 focus:shadow-sm"
                    />
                    {currentStep === 3 && (
                      <button
                        type="button"
                        onClick={skipVolume}
                        className="shrink-0 rounded-lg border border-zinc-700 px-4 py-2.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                      >
                        No lo sé / Saltar
                      </button>
                    )}
                  </div>
                </div>

                {/* Step 4: Link portada */}
                <div className={`transition-all duration-300 ${currentStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                    Ingresá el link de la portada
                    <span className="text-red-400 font-normal ml-1">*</span>
                  </label>
                  <input
                    type="url"
                    value={form.link_portada}
                    onChange={(e) => updateField('link_portada', e.target.value)}
                    placeholder={STEPS[3].placeholder}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]/30 focus:ring-2 focus:shadow-sm"
                  />
                  {form.link_portada && !form.link_portada.startsWith('https://') && (
                    <p className="mt-1 text-xs text-red-400">El link debe comenzar con https://</p>
                  )}
                </div>

                {/* Step 5: Comentarios */}
                <div className={`transition-all duration-300 ${currentStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                    Comentarios extras o instrucciones
                    <span className="text-zinc-500 font-normal ml-1">(opcional)</span>
                  </label>
                  <textarea
                    value={form.comentarios}
                    onChange={(e) => updateField('comentarios', e.target.value)}
                    placeholder={STEPS[4].placeholder}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]/30 focus:ring-2 focus:shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || !isStepValid(1) || !isStepValid(2) || !isStepValid(4)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting ? 'Enviando...' : 'Enviar petición'}
                </button>
                {error && <span className="text-xs text-red-400">{error}</span>}
              </div>
            </div>
          </form>

          {/* Mis Peticiones */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Mis Peticiones</h2>
            {peticiones.length === 0 ? (
              <p className="text-sm text-zinc-500">Aún no realizaste ninguna petición.</p>
            ) : (
              <div className="space-y-3">
                {peticiones.map((p) => {
                  const st = ESTADOS[p.estado] || ESTADOS.pendiente
                  return (
                    <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">{p.nombre_comic}</h3>
                            {p.numero_volumen && (
                              <span className="shrink-0 text-xs text-zinc-500">({p.numero_volumen})</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mb-1">{p.editorial}</p>
                          {p.respuesta_admin && (
                            <p className="mt-2 text-sm text-zinc-400 italic border-l-2 border-zinc-700 pl-3">
                              {p.respuesta_admin}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${st.class}`}>
                            {st.label}
                          </span>
                          <span className="text-[11px] text-zinc-600 whitespace-nowrap">
                            {new Date(p.fecha_creacion).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* FAQ-style limit alert */}
      {faqAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#1a1a1a] rounded-xl border border-zinc-800 p-5 shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2">
          <p className="text-sm text-zinc-100 leading-relaxed">{faqAlert}</p>
          <button
            onClick={() => setFaqAlert(null)}
            className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg bg-zinc-800 px-5 py-3.5 text-sm text-zinc-100 shadow-lg border border-zinc-700 animate-in slide-in-from-bottom-2 max-w-sm">
          <span className="shrink-0">✅</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
