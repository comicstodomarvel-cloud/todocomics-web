'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bell, Shield } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'

export default function AdminHeader({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const adminKey = searchParams.get('key') ?? ''
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const lastCountRef = useRef(0)

  const fetchUnreadCount = useCallback(async () => {
    if (!adminKey) return
    try {
      const res = await fetch('/api/admin/notificaciones?unread=true&limit=1', {
        headers: { 'x-admin-key': adminKey },
      })
      if (res.ok) {
        const data = await res.json()
        const total = data.total ?? 0
        setUnreadCount(total)
        // Si hay nuevas notificaciones y el dropdown no está abierto, vibrar badge
        if (total > lastCountRef.current && !dropdownOpen) {
          // El badge ya se actualiza visualmente con el número
        }
        lastCountRef.current = total
      }
    } catch {
      // silencio
    }
  }, [adminKey, dropdownOpen])

  useEffect(() => {
    fetchUnreadCount()
    pollingRef.current = setInterval(fetchUnreadCount, 30000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [fetchUnreadCount])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  return (
    <div className="min-h-screen bg-zinc-950">
      {adminKey && (
        <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-amber-500" />
              <span className="text-sm font-bold text-zinc-100">Admin Panel</span>
            </div>
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
                <NotificationDropdown adminKey={adminKey} onClose={() => setDropdownOpen(false)} />
              )}
            </div>
          </div>
        </header>
      )}
      {children}
    </div>
  )
}
