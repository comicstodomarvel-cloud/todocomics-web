'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import type { ContentItem } from '@/lib/data'
import ContentCard from './ContentCard'
import ContentListItem from './ContentListItem'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('session_id', sid)
  }
  return sid
}

interface FavoritosSectionProps {
  viewMode?: 'grid' | 'lista'
  updateDates: Record<string, string>
  brokenIds: string[]
  reportedIds: string[]
}

export default function FavoritosSection({ viewMode, updateDates, brokenIds, reportedIds }: FavoritosSectionProps) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const brokenSet = new Set(brokenIds)
  const reportedSet = new Set(reportedIds)

  useEffect(() => {
    const sessionId = getSessionId()

    fetch(`/api/favoritos?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (items.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Heart size={20} className="text-red-400" />
        <h2 className="text-2xl font-bold">Mis favoritos</h2>
      </div>

      {viewMode === 'lista' ? (
        <div className="space-y-3">
          {items.map((item) => (
            <ContentListItem
              key={item.id}
              item={item}
              lastUpdateDate={updateDates[item.id]}
              linkCaido={brokenSet.has(item.id)}
              linkReportado={reportedSet.has(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              lastUpdateDate={updateDates[item.id]}
              linkCaido={brokenSet.has(item.id)}
              linkReportado={reportedSet.has(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
