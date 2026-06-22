'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

interface SortSelectProps {
  current: string
  busqueda?: string
  categoria?: string
  hashtag?: string
  vista?: string
}

const SORT_OPTIONS = [
  { value: 'reciente', label: 'Nuevos' },
  { value: 'antiguo', label: 'Antiguos' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
]

export default function SortSelect({ current, busqueda, categoria, hashtag, vista }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sp = new URLSearchParams()
    if (busqueda) sp.set('busqueda', busqueda)
    if (categoria) sp.set('categoria', categoria)
    if (hashtag) sp.set('hashtag', hashtag)
    if (vista) sp.set('vista', vista)
    sp.set('orden', e.target.value)
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="sm:hidden relative">
      <ArrowUpDown size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
      <select
        value={current}
        onChange={handleChange}
        className="appearance-none bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 pl-8 pr-7 py-2 outline-none focus:border-amber-500 transition-colors min-h-[36px]"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
        width={12}
        height={12}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
