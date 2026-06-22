'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ContentItem } from '@/lib/data'
import ContentCard from './ContentCard'
import ContentListItem from './ContentListItem'

interface LoadMoreButtonProps {
  initialItems?: ContentItem[]
  hasMorePages?: boolean
  viewMode?: 'grid' | 'lista'
  updateDates: Record<string, string>
  brokenIds: string[]
  reportedIds: string[]
  searchQuery?: string
  orden?: string
}

export default function LoadMoreButton({
  initialItems = [],
  hasMorePages = false,
  viewMode = 'grid',
  updateDates,
  brokenIds,
  reportedIds,
  searchQuery = '',
  orden = 'reciente',
}: LoadMoreButtonProps) {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const brokenSet = new Set(brokenIds)
  const reportedSet = new Set(reportedIds)

  const allItems = [...initialItems, ...items]

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !hasMorePages) return
    setLoading(true)
    setError('')
    const nextPage = page + 1
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    params.set('limit', '20')
    params.set('orden', orden)

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
  }, [page, searchParams, loading, hasMore, hasMorePages])

  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setLoaded(false)
    setError('')
  }, [searchParams])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && hasMorePages && !loading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, hasMore, hasMorePages, loading])

  return (
    <>
      {viewMode === 'lista' ? (
        <div className="space-y-3">
          {allItems.map((item) => (
            <ContentListItem
              key={item.id}
              item={item}
              lastUpdateDate={updateDates[item.id]}
              linkCaido={brokenSet.has(item.id)}
              linkReportado={reportedSet.has(item.id)}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {allItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              lastUpdateDate={updateDates[item.id]}
              linkCaido={brokenSet.has(item.id)}
              linkReportado={reportedSet.has(item.id)}
              searchQuery={searchQuery}
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

      {allItems.length > 0 && !hasMore && loaded && hasMorePages && (
        <p className="mt-8 text-center text-sm text-zinc-600">
          Llegaste al final del catálogo
        </p>
      )}
    </>
  )
}
