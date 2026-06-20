'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
  const sentinelRef = useRef<HTMLDivElement>(null)
  const brokenSet = new Set(brokenIds)
  const reportedSet = new Set(reportedIds)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
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
  }, [page, searchParams, loading, hasMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, hasMore, loading])

  if (!hasMore && loaded && items.length === 0) return null

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
        <>
          <div ref={sentinelRef} className="h-4" />
          <div className="mt-4 mb-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
            <p className="mt-2 text-sm text-zinc-500">Cargando más...</p>
          </div>
        </>
      )}

      {!hasMore && loaded && (
        <p className="mt-8 text-center text-sm text-zinc-600">
          Llegaste al final del catálogo
        </p>
      )}
    </>
  )
}
