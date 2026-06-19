'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'

export default function ViewModeToggle() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const mode = searchParams.get('vista') ?? 'grid'

  useEffect(() => {
    if (!searchParams.has('vista')) {
      const saved = localStorage.getItem('vista') ?? 'grid'
      if (saved !== 'grid') {
        const params = new URLSearchParams(searchParams.toString())
        params.set('vista', saved)
        router.replace(`${pathname}?${params.toString()}`)
      }
    }
  }, [searchParams, router, pathname])

  function setMode(m: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('vista', m)
    router.push(`${pathname}?${params.toString()}`)
    localStorage.setItem('vista', m)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 p-1">
      <button
        onClick={() => setMode('grid')}
        className={`rounded-md p-2 transition-colors ${
          mode === 'grid'
            ? 'bg-amber-500 text-black'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
        aria-label="Vista cuadrícula"
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => setMode('lista')}
        className={`rounded-md p-2 transition-colors ${
          mode === 'lista'
            ? 'bg-amber-500 text-black'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
        aria-label="Vista lista"
      >
        <List size={16} />
      </button>
    </div>
  )
}
