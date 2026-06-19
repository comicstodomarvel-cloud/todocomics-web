'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ContentItem } from '@/lib/data'
import ContentCard from './ContentCard'
import ContentListItem from './ContentListItem'

interface LoadMoreButtonProps {
  initialPage?: number
  viewMode?: 'grid' | 'lista'
  updateDates: Record<string, string>
  brokenIds: string[]
  reportedIds: string[]
}

export default function LoadMoreButton({
  initialPage = 1,
  viewMode = 'grid',
  updateDates,
  brokenIds,
  reportedIds,
}: LoadMoreButtonProps) {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(initialPage)
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const brokenSet = new Set(brokenIds)
  const reportedSet = new Set(reportedIds)

  const loadMore = useCallback(async () => {
    setLoading(true)
    setError('')
    const nextPage = page + 1
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    params.set('limit', '20')

    try {
      const res = await fetch(`/api/contenido?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar más contenido')
      const data = await res.json()
      setItems((prev) => [...prev, ...data.items])
      setHasMore(data.hasMore)
      setPage(nextPage)
      setLoaded(true)
    } catch (e) {
      setError('Error al cargar más contenido')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, searchParams])

  if (!hasMore && loaded) return null

  return (
    <>
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

      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-8 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </>
  )
}
