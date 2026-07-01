'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Shield, LogOut, Import, FileEdit, Trash2, SearchCheck, HelpCircle, MessageSquare, Flag, BarChart3 } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import type { AdminUser } from '@/lib/admin-auth'

interface Props {
  user: AdminUser
  children: React.ReactNode
}

const navItems = {
  admin: [
    { href: '/admin/importar', label: 'Importar Post', icon: Import },
    { href: '/admin/editar', label: 'Editar Post', icon: FileEdit },
    { href: '/admin/eliminar', label: 'Eliminar Post', icon: Trash2 },
    { href: '/admin/revisar', label: 'Revisar Contenido', icon: SearchCheck },
    { href: '/admin/faq', label: 'Gestionar FAQ', icon: HelpCircle },
    { href: '/admin/peticiones', label: 'Peticiones', icon: MessageSquare },
    { href: '/admin/reportes', label: 'Reportes', icon: Flag },
    { href: '/admin/monitoreo', label: 'Monitoreo', icon: BarChart3 },
  ],
  editor: [
    { href: '/admin/importar', label: 'Importar Post', icon: Import },
  ],
}

export default function AdminHeader({ user, children }: Props) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const lastCountRef = useRef(0)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notificaciones?unread=true&limit=1', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const total = data.total ?? 0
        setUnreadCount(total)
        lastCountRef.current = total
      }
    } catch {
      // silencio
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    pollingRef.current = setInterval(fetchUnreadCount, 30000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [fetchUnreadCount])

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      const isInsideDropdown = document.querySelector('.notif-dropdown')?.contains(target)
      if (bellRef.current && !bellRef.current.contains(target) && !isInsideDropdown) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const items = navItems[user.role] || navItems.editor

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-amber-500 shrink-0" />
            <span className="text-sm font-bold text-zinc-100 hidden sm:inline">
              {user.display_name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              {user.role === 'admin' ? 'Admin' : 'Editor'}
            </span>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto max-w-[60%] scrollbar-none">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors whitespace-nowrap"
              >
                <item.icon size={14} />
                <span className="hidden sm:inline">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                ref={bellRef}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                aria-label="Notificaciones"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {dropdownOpen && (
                <NotificationDropdown onClose={() => setDropdownOpen(false)} />
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}
