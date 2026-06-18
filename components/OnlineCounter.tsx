'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

export default function OnlineCounter() {
  const [online, setOnline] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/presencia')
        if (res.ok) {
          const data = await res.json()
          setOnline(data.online)
        }
      } catch {
        // silencio
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (online === null) return null

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 shrink-0">
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <Users size={14} className="text-zinc-500" />
      <span className="font-medium">{online}</span>
      <span className="text-zinc-500 hidden sm:inline">
        {online === 1 ? 'usuario ahora' : 'usuarios ahora'}
      </span>
    </div>
  )
}
