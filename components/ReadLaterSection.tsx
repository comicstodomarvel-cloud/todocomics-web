'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import { X, Bookmark } from 'lucide-react'
import type { ContentItem } from '@/lib/data'

function getSavedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('readLater')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function ReadLaterSection() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchSaved() {
    const ids = getSavedIds()
    if (ids.length === 0) {
      setItems([])
      return
    }

    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase
        .from('contenido')
        .select('*')
        .in('id', ids)
      setItems((data as ContentItem[]) ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSaved()
    window.addEventListener('readLaterChanged', fetchSaved)
    return () => window.removeEventListener('readLaterChanged', fetchSaved)
  }, [])

  function removeItem(id: string) {
    const ids = getSavedIds().filter((i) => i !== id)
    localStorage.setItem('readLater', JSON.stringify(ids))
    setItems((prev) => prev.filter((i) => i.id !== id))
    window.dispatchEvent(new Event('readLaterChanged'))
  }

  if (items.length === 0 && !loading) return null

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark size={18} className="text-amber-400" />
        <h2 className="text-xl font-bold text-zinc-100">
          Tu lista ({items.length})
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {loading ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-36 bg-zinc-800 rounded-lg animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="relative shrink-0 group">
              <Link
                href={`/item/${item.id}`}
                className="block w-24 h-36 overflow-hidden rounded-lg bg-zinc-800 relative"
              >
                <ImageWithFallback
                  src={item.url_portada}
                  alt={item.titulo}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>
              <button
                onClick={() => removeItem(item.id)}
                className="absolute -top-1.5 -right-1.5 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Quitar de la lista"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
