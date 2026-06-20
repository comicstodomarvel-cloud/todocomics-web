'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  id: string
  pregunta: string
  respuesta: string
  orden: number
}

export default function FaqSection() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/faq')
        const data = await res.json()
        setItems(data)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function toggleItem(index: number) {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 animate-pulse">
            <div className="h-5 bg-zinc-800 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>No hay preguntas frecuentes disponibles.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openItems.has(index)
        return (
          <div
            key={item.id}
            className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-800/50"
            >
              <span className="font-semibold text-zinc-100 text-sm sm:text-base leading-relaxed pr-2">
                {item.pregunta}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-5 pb-5 text-zinc-400 text-sm sm:text-base leading-relaxed [&_strong]:text-amber-500 [&_br]:block [&_br]:content-['']">
                <span dangerouslySetInnerHTML={{ __html: item.respuesta }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
