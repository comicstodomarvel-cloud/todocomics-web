'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Heart } from 'lucide-react'

type TopItem = {
  id: string
  titulo: string
  portada_url: string
  categoria: string
  likes: number
}

export default function TopWeekly() {
  const [items, setItems] = useState<TopItem[]>([])

  useEffect(() => {
    let mounted = true

    async function fetchTop() {
      try {
        const res = await fetch('/api/top-weekly?limit=5')
        if (res.ok) {
          const data = await res.json()
          if (mounted) setItems(data)
        }
      } catch {
        // silencio
      }
    }

    fetchTop()
    const interval = setInterval(fetchTop, 60000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <aside className="fixed left-4 top-20 z-40 hidden xl:flex flex-col w-52 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-1.5 mb-2.5 px-1">
          <TrendingUp size={15} className="text-amber-400" />
          <h3 className="text-xs font-bold text-zinc-100 tracking-tight">Top Semanal</h3>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="group flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-500 shrink-0 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-colors">
                {i + 1}
              </span>

              {item.portada_url && (
                <img
                  src={item.portada_url}
                  alt=""
                  className="w-7 h-10 rounded object-cover border border-zinc-700/50 shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-zinc-300 group-hover:text-zinc-100 transition-colors leading-tight block truncate">
                  {item.titulo}
                </span>
              </div>

              <span className="text-[10px] text-zinc-600 flex items-center gap-0.5 shrink-0">
                <Heart size={9} /> {item.likes}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
