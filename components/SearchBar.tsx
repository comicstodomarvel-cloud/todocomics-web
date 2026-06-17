'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function SearchBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(searchParams.get('busqueda') ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setValue(searchParams.get('busqueda') ?? '')
  }, [searchParams])

  function updateUrl(query: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('busqueda', query)
    } else {
      params.delete('busqueda')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setValue(q)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => updateUrl(q), 400)
  }

  function handleClear() {
    setValue('')
    updateUrl('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-md">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Buscar cómics, películas, series..."
        className="w-full rounded-full border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
