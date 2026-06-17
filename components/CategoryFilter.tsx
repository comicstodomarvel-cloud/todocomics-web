'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

const CATEGORIES = [
  { label: 'Todos', value: '' },
  { label: 'Cómic', value: 'Comic' },
  { label: 'Manga', value: 'Manga' },
  { label: 'Película', value: 'Pelicula' },
  { label: 'Serie', value: 'Serie' },
  { label: 'Libro', value: 'Libro' },
] as const

export default function CategoryFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const active = searchParams.get('categoria') ?? ''

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('categoria', value)
    } else {
      params.delete('categoria')
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => handleClick(cat.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === cat.value
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
