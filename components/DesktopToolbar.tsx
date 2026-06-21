'use client'

import { usePlayer } from '@/lib/playerStore'
import { Suspense } from 'react'
import HashtagFilter from './HashtagFilter'
import UpdatesDropdownButton from './updates/UpdatesDropdownButton'
import { Search, X, Headphones } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function ToolbarSearch() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(searchParams.get('busqueda') ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(searchParams.get('busqueda') ?? '')
  }, [searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setValue(q)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (pathname === '/') {
        const params = new URLSearchParams(searchParams.toString())
        if (q) params.set('busqueda', q)
        else params.delete('busqueda')
        router.push(`${pathname}?${params.toString()}`)
      } else {
        router.push(`/?busqueda=${encodeURIComponent(q)}`)
      }
    }, 400)
  }

  function handleClear() {
    setValue('')
    if (pathname === '/') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('busqueda')
      router.push(`${pathname}?${params.toString()}`)
    }
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex-1 max-w-md">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Buscar cómics, películas, series..."
        className="w-full rounded-full border border-zinc-700 bg-zinc-800 py-1.5 pl-9 pr-8 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default function DesktopToolbar() {
  const { toggleDesktopCollapsed, isDesktopCollapsed } = usePlayer()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 hidden lg:flex items-center gap-3 px-4 safe-top safe-left safe-right">
      <a href="/" className="flex items-center gap-2 shrink-0 mr-2">
        <span className="text-lg font-bold text-white">TodoComics</span>
      </a>

      <Suspense fallback={null}>
        <ToolbarSearch />
      </Suspense>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Suspense fallback={null}>
          <HashtagFilter variant="toolbar" />
        </Suspense>
        <UpdatesDropdownButton variant="toolbar" />

        <a
          href="https://discord.gg/nKTnYSTRHE"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white flex items-center justify-center text-zinc-400 transition-all"
          title="Discord"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
          </svg>
        </a>

        <button
          onClick={toggleDesktopCollapsed}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            !isDesktopCollapsed
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title="Reproductor de música"
        >
          <Headphones size={18} />
        </button>
      </div>
    </div>
  )
}
