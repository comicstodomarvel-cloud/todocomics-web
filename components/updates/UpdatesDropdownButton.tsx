'use client'

import { useState, useEffect, useCallback } from 'react'
import UpdatesDropdownPanel from '../UpdatesDropdownPanel'

export default function UpdatesDropdownButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const checkUnreadUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/updates/latest?limit=10')
      const data = await res.json()

      const lastCheck = localStorage.getItem('lastUpdatesCheck')

      if (data.updates && data.updates.length > 0) {
        const hasNew = data.updates.some((update: { fecha: string }) => {
          const updateDate = new Date(update.fecha).getTime()
          const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0
          return updateDate > lastCheckTime
        })

        setHasUnread(hasNew)
      }
    } catch (error) {
      console.error('Error checking updates:', error)
    }
  }, [])

  useEffect(() => {
    checkUnreadUpdates()
  }, [checkUnreadUpdates])

  const handleToggle = useCallback(() => {
    const newState = !isOpen
    setIsOpen(newState)

    if (newState) {
      localStorage.setItem('lastUpdatesCheck', Date.now().toString())
      setHasUnread(false)
    }
  }, [isOpen])

  return (
    <div>
      <button
        onClick={handleToggle}
        className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-4 py-2.5 min-h-[44px] rounded-full shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105"
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-sm">Updates</span>

        {hasUnread && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            !
          </span>
        )}

        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-20 sm:absolute sm:left-full sm:top-0 sm:ml-2 w-auto sm:w-96 max-w-[384px] z-50">
          <UpdatesDropdownPanel onClose={() => setIsOpen(false)} />
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
