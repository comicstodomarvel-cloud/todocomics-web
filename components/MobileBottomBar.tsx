'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { usePlayer } from '@/lib/playerStore'
import { Search, Filter, MessageCircle, Music, X } from 'lucide-react'
import HashtagFilterPanel from './HashtagFilterPanel'

const DISCORD_INVITE = 'https://discord.gg/nKTnYSTRHE'

function MusicButton() {
  const { toggleSheet, isPlaying, playlist, currentIndex } = usePlayer()
  const track = currentIndex >= 0 ? playlist[currentIndex] : null
  const hasMusic = playlist.length > 0

  return (
    <button
      onClick={toggleSheet}
      className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-zinc-100 transition-colors flex-1 min-w-0 py-1"
      aria-label="Abrir reproductor"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {isPlaying && hasMusic && track ? (
          <img
            src={track.thumbnail}
            alt=""
            className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-500/50"
          />
        ) : (
          <Music size={20} />
        )}
        {isPlaying && hasMusic && (
          <>
            <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-music-ring-1" />
            <span className="absolute inset-0 rounded-full bg-amber-500/10 animate-music-ring-2" />
          </>
        )}
      </div>
      <span className="text-[10px] leading-none">Música</span>
    </button>
  )
}

export default function MobileBottomBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('busqueda') ?? '')
  const [showFilters, setShowFilters] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setSearchValue(searchParams.get('busqueda') ?? '')
  }, [searchParams])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  function updateSearch(query: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('busqueda', query)
    } else {
      params.delete('busqueda')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchValue(q)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => updateSearch(q), 400)
  }

  function handleSearchClear() {
    setSearchValue('')
    updateSearch('')
    searchInputRef.current?.focus()
  }

  function closeAll() {
    setShowFilters(false)
    setSearchOpen(false)
  }

  const activeHashtag = searchParams.get('hashtag') ?? ''

  function handleFilterSelect(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('hashtag', id)
    } else {
      params.delete('hashtag')
    }
    params.delete('categoria')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
    setShowFilters(false)
  }

  return (
    <>
      {/* Backdrops for dropdowns */}
      {showFilters && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={closeAll}
        />
      )}

      {/* Filters dropdown above bar */}
      {showFilters && (
        <div className="fixed left-4 right-4 bottom-20 z-50 lg:hidden">
          <HashtagFilterPanel
            activeHashtag={activeHashtag}
            onSelect={handleFilterSelect}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 safe-bottom">
        {searchOpen ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <Search size={18} className="text-zinc-500 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Buscar cómics, películas, series..."
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none min-h-[44px]"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="text-zinc-500 hover:text-zinc-300 shrink-0"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={() => { setSearchOpen(false); setSearchValue(''); }}
              className="text-zinc-400 hover:text-zinc-100 text-sm font-medium shrink-0"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-around px-2 py-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-zinc-100 transition-colors flex-1 min-w-0 py-1"
              aria-label="Buscar"
            >
              <Search size={20} />
              <span className="text-[10px] leading-none">Buscar</span>
            </button>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(true)}
              className={`flex flex-col items-center gap-0.5 transition-colors flex-1 min-w-0 py-1 ${
                showFilters ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-100'
              }`}
              aria-label="Filtros"
            >
              <Filter size={20} />
              <span className="text-[10px] leading-none">Filtros</span>
            </button>

            {/* Discord */}
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-zinc-100 transition-colors flex-1 min-w-0 py-1"
              aria-label="Unirse a Discord"
            >
              <MessageCircle size={20} />
              <span className="text-[10px] leading-none">Discord</span>
            </a>

            {/* Music */}
            <MusicButton />
          </div>
        )}
      </div>
    </>
  )
}
