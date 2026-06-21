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
    <div className={variant === 'toolbar' ? 'relative' : ''}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex items-center gap-2 font-bold transition-all duration-300 ${
          variant === 'sidebar' ? 'px-4 py-2.5 min-h-[44px] rounded-full shadow-lg hover:scale-105' : 'w-9 h-9 rounded-lg justify-center'
        } ${
          activeHashtag
            ? variant === 'sidebar'
              ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/30'
              : 'bg-zinc-800 text-amber-500 border border-amber-500/50'
            : 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700'
        }`}
        title="Filtros"
      >
        <Filter size={18} />
        {variant === 'sidebar' && <span className="text-sm">Filtros</span>}
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
