'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { HASHTAG_FILTERS } from '@/lib/hashtags'

export default function HashtagFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const activeHashtag = searchParams.get('hashtag') ?? ''

  function handleSelect(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('hashtag', id)
    } else {
      params.delete('hashtag')
    }
    params.delete('categoria')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
    setIsOpen(false)
  }

  function handleToggle() {
    setIsOpen((prev) => !prev)
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        className={`relative flex items-center gap-2 font-bold px-4 py-2.5 min-h-[44px] rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
          activeHashtag
            ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/30'
            : 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        <Filter size={18} />
        <span className="text-sm">Filtros</span>
        {activeHashtag && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-full sm:top-0 sm:ml-2 w-auto sm:w-[400px] max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-lg">Filtrar por categoría</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleSelect('')}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    !activeHashtag
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  Todos
                </button>
                {HASHTAG_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                      activeHashtag === cat.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
