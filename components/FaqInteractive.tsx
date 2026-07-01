'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Sparkles, AlertTriangle, Users } from 'lucide-react'
import FaqSection from '@/components/FaqSection'

const CATEGORY_LABELS: Record<string, string> = {
  Comic: 'C&oacute;mics',
  Manga: 'Mangas',
  Pelicula: 'Pel&iacute;culas',
  Serie: 'Series',
  Anime: 'Animes',
  Libro: 'Libros',
}

const CATEGORY_ORDER = ['Comic', 'Serie', 'Pelicula', 'Manga', 'Anime', 'Libro']

export default function FaqInteractive({
  stats,
}: {
  stats: { total: number; byCategory: Record<string, number> } | null
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [online, setOnline] = useState<number | null>(null)

  useEffect(() => {
    async function fetchOnline() {
      try {
        const res = await fetch('/api/presencia')
        if (res.ok) {
          const data = await res.json()
          setOnline(data.online)
        }
      } catch {
        /* silencio */
      }
    }
    fetchOnline()
    const interval = setInterval(fetchOnline, 30000)
    return () => clearInterval(interval)
  }, [])

  const sortedCategories = CATEGORY_ORDER.filter(
    (cat) => (stats?.byCategory[cat] ?? 0) > 0
  )

  return (
    <>
      {/* ─── 1. HERO SECTION ─── */}
      <section className="py-16 md:py-24 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            Preguntas Frecuentes
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mb-8 max-w-lg mx-auto">
            Respuestas a las dudas más comunes sobre TodoComics
          </p>

          <div className="relative max-w-md mx-auto">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar preguntas..."
              className="w-full rounded-full border border-zinc-700 bg-[#1a1a1a] py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-300 focus:border-[#ff8c00] focus:ring-1 focus:ring-[#ff8c00]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                &#10005;
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── 2. QUICK ACCESS CARDS ─── */}
      <section className="max-w-5xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://discord.gg/todocomics"
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-[#1a1a1a] rounded-xl border border-zinc-800 p-5 transition-all duration-300 hover:border-[#ff8c00] hover:shadow-lg hover:shadow-[#ff8c00]/5 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg bg-[#ff8c00]/10 flex items-center justify-center mb-3 group-hover:bg-[#ff8c00]/20 transition-colors">
              <svg className="w-5 h-5 text-[#ff8c00]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Comunidad</h3>
            <p className="text-zinc-500 text-xs leading-relaxed mb-3">
              Unite a nuestro Discord y conversá con otros lectores. Soporte, novedades y m&aacute;s.
            </p>
            <span className="text-[#ff8c00] text-xs font-semibold group-hover:underline decoration-[#ff8c00] underline-offset-2">
              Ir a Discord &rarr;
            </span>
          </a>

          <Link
            href="/updates"
            className="group block bg-[#1a1a1a] rounded-xl border border-zinc-800 p-5 transition-all duration-300 hover:border-[#ff8c00] hover:shadow-lg hover:shadow-[#ff8c00]/5 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg bg-[#ff8c00]/10 flex items-center justify-center mb-3 group-hover:bg-[#ff8c00]/20 transition-colors">
              <Sparkles size={20} className="text-[#ff8c00]" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Novedades</h3>
            <p className="text-zinc-500 text-xs leading-relaxed mb-3">
              El cat&aacute;logo se actualiza semanalmente. Segu&iacute; las &uacute;ltimas novedades y lanzamientos.
            </p>
            <span className="text-[#ff8c00] text-xs font-semibold group-hover:underline decoration-[#ff8c00] underline-offset-2">
              Ver novedades &rarr;
            </span>
          </Link>

          <Link
            href="/"
            className="group block bg-[#1a1a1a] rounded-xl border border-zinc-800 p-5 transition-all duration-300 hover:border-[#ff8c00] hover:shadow-lg hover:shadow-[#ff8c00]/5 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg bg-[#ff8c00]/10 flex items-center justify-center mb-3 group-hover:bg-[#ff8c00]/20 transition-colors">
              <AlertTriangle size={20} className="text-[#ff8c00]" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Soporte Directo</h3>
            <p className="text-zinc-500 text-xs leading-relaxed mb-3">
              Encontraste un link ca&iacute;do o contenido duplicado? Reportalo desde la web.
            </p>
            <span className="text-[#ff8c00] text-xs font-semibold group-hover:underline decoration-[#ff8c00] underline-offset-2">
              C&oacute;mo reportar &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* ─── 3. TWO-COLUMN LAYOUT ─── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar — oculto en mobile */}
          <aside className="hidden md:block md:w-[30%] shrink-0">
            <div className="sticky top-8 space-y-5">
              <div className="bg-[#121212] rounded-xl border border-zinc-800 p-6">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#ff8c00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  TodoComics en cifras
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-white font-bold">
                      {stats ? `${stats.total.toLocaleString()}+` : '...'}
                    </span>
                  </div>
                  {sortedCategories.map((cat) => (
                    <div
                      key={cat}
                      className="flex justify-between items-center border-b border-zinc-800 pb-2 last:border-b-0"
                    >
                      <span
                        className="text-zinc-400"
                        dangerouslySetInnerHTML={{ __html: CATEGORY_LABELS[cat] || cat }}
                      />
                      <span className="text-white font-bold">
                        {stats?.byCategory[cat].toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Users size={14} className="text-zinc-500" />
                      Usuarios activos
                    </span>
                    <span className="text-white font-bold flex items-center gap-1.5">
                      {online !== null ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          {online}
                        </>
                      ) : (
                        <span className="text-zinc-600">...</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#121212] rounded-xl border border-zinc-800 p-6">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#ff8c00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Buenas pr&aacute;cticas
                </h3>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-[#ff8c00] shrink-0">&bull;</span>
                    Revis&aacute; la contrase&ntilde;a antes de reportar
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff8c00] shrink-0">&bull;</span>
                    Report&aacute; solo links ca&iacute;dos verificados
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff8c00] shrink-0">&bull;</span>
                    Consult&aacute; el FAQ antes de preguntar
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff8c00] shrink-0">&bull;</span>
                    Respet&aacute; a los dem&aacute;s miembros
                  </li>
                </ul>
              </div>

              <a
                href="https://discord.gg/todocomics"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#1a1a1a] hover:bg-[#222] rounded-xl border border-zinc-800 hover:border-[#ff8c00] p-5 transition-all duration-300 text-center group"
              >
                <p className="text-white font-bold text-sm mb-1">&iquest;Consultas?</p>
                <p className="text-zinc-500 text-xs mb-3">Respuesta r&aacute;pida en Discord</p>
                <span className="inline-flex items-center gap-1.5 text-[#ff8c00] text-xs font-semibold group-hover:underline underline-offset-2">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Ir a Discord &rarr;
                </span>
              </a>
            </div>
          </aside>

          <main className="w-full md:w-[70%] min-w-0">
            <FaqSection searchQuery={searchQuery} />
          </main>
        </div>
      </section>
    </>
  )
}
