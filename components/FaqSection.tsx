'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  id: string
  pregunta: string
  respuesta: string
  orden: number
}

export default function FaqSection({ searchQuery = '' }: { searchQuery?: string }) {
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

  const filtered = searchQuery.trim()
    ? items.filter(
        (item) =>
          item.pregunta.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.respuesta.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#121212] rounded-xl border border-zinc-800 p-4 animate-pulse">
            <div className="h-5 bg-zinc-800 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        {searchQuery ? (
          <>
            <p className="mb-1">No hay preguntas que coincidan con</p>
            <p className="text-zinc-400 font-semibold">&ldquo;{searchQuery}&rdquo;</p>
          </>
        ) : (
          <p>No hay preguntas frecuentes disponibles.</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filtered.map((item, index) => {
        const isOpen = openItems.has(index)
        return (
          <div
            key={item.id}
            className="bg-[#121212] rounded-xl border border-zinc-800 overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-800/30"
            >
              <span className="font-semibold text-zinc-100 text-sm sm:text-base leading-relaxed pr-2">
                {highlightText(item.pregunta, searchQuery)}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-y-auto transition-all duration-300 ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-5 pb-5 text-zinc-400 text-sm sm:text-base leading-relaxed [&_strong]:text-[#ff8c00] [&_br]:block [&_br]:content-['']">
                <span dangerouslySetInnerHTML={{ __html: item.respuesta }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-[#ff8c00]/20 text-[#ff8c00] rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
