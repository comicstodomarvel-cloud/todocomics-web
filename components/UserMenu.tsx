'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, Heart } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import LoginModal from './LoginModal'

export default function UserMenu() {
  const { user, perfil, loading, signOut } = useAuth()
  const [openLogin, setOpenLogin] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (loading) return null

  if (!user) {
    return (
      <>
        <button
          onClick={() => setOpenLogin(true)}
          className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700"
        >
          <User size={16} />
          <span className="hidden sm:inline">Iniciar sesión</span>
        </button>
        <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      </>
    )
  }

  const avatarUrl = perfil?.avatar_url
  const initials = (perfil?.nickname ?? user.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
            {initials}
          </span>
        )}
        <span className="hidden sm:inline max-w-[120px] truncate">
          {perfil?.nickname ?? user.email?.split('@')[0]}
        </span>
      </button>

      {openMenu && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-700 bg-zinc-900 py-2 shadow-2xl">
          <div className="border-b border-zinc-700 px-4 pb-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">
              {perfil?.nickname ?? 'Usuario'}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>

          <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white">
            <Heart size={16} />
            Mis favoritos
          </button>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
