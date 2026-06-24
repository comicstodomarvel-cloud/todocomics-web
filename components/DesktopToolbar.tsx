'use client'

import { Suspense, type ReactNode } from 'react'
import HashtagFilter from './HashtagFilter'
import UpdatesDropdownButton from './updates/UpdatesDropdownButton'
import OnlineCounter from './OnlineCounter'
import TeraboxDownloadButton from './TeraboxDownloadButton'
import { Search, X, Gift, HelpCircle, Pencil } from 'lucide-react'
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
    <div className="relative max-w-md w-full">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Buscar cómics, películas, series..."
        className="w-full rounded-full bg-zinc-900/50 border border-zinc-800 py-1.5 pl-9 pr-8 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-[#ff8c00] focus:ring-2 focus:ring-[#ff8c00]/20 focus:shadow-[0_0_12px_rgba(255,140,0,0.12)]"
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

export default function DesktopToolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/75 backdrop-blur-md border-b border-zinc-900 hidden lg:block safe-top safe-left safe-right">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-6">
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="https://axfugtisjsjbkqlkixla.supabase.co/storage/v1/object/public/portadas/MTC.png"
            alt="TodoComics"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-amber-500">TODO</span><span className="text-red-500">COMICS</span>
          </span>
        </a>

        <div className="flex-1 max-w-lg mx-auto">
          <Suspense fallback={null}>
            <ToolbarSearch />
          </Suspense>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <OnlineCounter variant="toolbar" />

          <TeraboxDownloadButton variant="toolbar" />

          <Suspense fallback={null}>
            <HashtagFilter variant="toolbar" />
          </Suspense>
          <UpdatesDropdownButton variant="toolbar" />

          <a
            href="/faq"
            className="group relative flex justify-center w-10 h-10 rounded-full items-center text-zinc-400 hover:text-[#ff8c00] hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(255,140,0,0.4)] hover:bg-zinc-800/40 transition-all duration-200"
          >
            <HelpCircle size={18} />
            <span className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-50 animate-fade-in bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
              Preguntas Frecuentes
            </span>
          </a>

          <a
            href="/peticiones"
            className="group relative flex justify-center w-10 h-10 rounded-full items-center text-zinc-400 hover:text-[#ff8c00] hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(255,140,0,0.4)] hover:bg-zinc-800/40 transition-all duration-200"
          >
            <Pencil size={18} />
            <span className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-50 animate-fade-in bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
              Solicitar un Cómic
            </span>
          </a>

          {children}

          <a
            href="https://discord.gg/nKTnYSTRHE"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex justify-center w-10 h-10 rounded-full items-center text-zinc-400 hover:text-[#ff8c00] hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(255,140,0,0.4)] hover:bg-zinc-800/40 transition-all duration-200"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
            <span className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-50 animate-fade-in bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
              Servidor de Discord
            </span>
          </a>

          <a
            href="https://www.terabox.com/referral/4401765338615"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-3 py-1.5 rounded-full text-xs transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 shrink-0 ml-2"
          >
            <Gift size={14} />
            <span>1TB GRATIS</span>
          </a>
        </div>
      </div>
    </div>
  )
}
