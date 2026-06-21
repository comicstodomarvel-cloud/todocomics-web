'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Filter } from 'lucide-react'
import HashtagFilterPanel from './HashtagFilterPanel'

export default function HashtagFilter({ variant = 'sidebar' }: { variant?: 'sidebar' | 'toolbar' }) {
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

  return (
    <div className={variant === 'toolbar' ? 'relative group' : ''}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex items-center gap-2 font-bold transition-all duration-200 ${
          variant === 'sidebar' ? 'px-4 py-2.5 min-h-[44px] rounded-full shadow-lg hover:scale-105' : 'w-10 h-10 rounded-full justify-center hover:scale-110 hover:shadow-[0_0_10px_rgba(255,140,0,0.4)]'
        } ${
          activeHashtag
            ? variant === 'sidebar'
              ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/30'
              : 'text-[#ff8c00] hover:bg-zinc-800/50'
            : variant === 'sidebar'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700'
              : 'text-zinc-400 hover:text-[#ff8c00] hover:bg-zinc-800/50'
        }`}
        title="Filtros"
      >
        <Filter size={18} />
        {variant === 'sidebar' && <span className="text-sm">Filtros</span>}
        {variant === 'toolbar' && (
          <span className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-50 animate-fade-in bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
            Filtrar Catálogo
          </span>
        )}
        {activeHashtag && (
          <span className={`w-2 h-2 rounded-full bg-amber-500 animate-pulse ${variant === 'toolbar' ? 'absolute -top-0.5 -right-0.5' : ''}`} />
        )}
        {variant === 'sidebar' && (
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`fixed left-4 right-4 top-20 z-50 w-auto ${
            variant === 'toolbar'
              ? 'sm:absolute sm:top-full sm:left-0 sm:mt-2 sm:w-[400px] max-w-[400px]'
              : 'sm:absolute sm:left-full sm:top-0 sm:ml-2 sm:w-[400px] max-w-[400px]'
          }`}>
            <HashtagFilterPanel
              activeHashtag={activeHashtag}
              onSelect={handleSelect}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  )
}
