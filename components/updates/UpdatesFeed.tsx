'use client'

import { useState } from 'react'
import UpdateCard from './UpdateCard'
import type { Update } from '@/lib/types'

interface UpdatesFeedProps {
  initialUpdates: Update[]
  initialTotal: number
}

export default function UpdatesFeed({ initialUpdates, initialTotal }: UpdatesFeedProps) {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const limit = 20
  const totalPages = Math.ceil(initialTotal / limit)
  const hasMore = page < totalPages

  const loadMore = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/updates?page=${page + 1}&limit=${limit}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUpdates((prev) => [...prev, ...data.updates])
      setPage((prev) => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <UpdateCard key={update.id} update={update} />
      ))}

      {error && (
        <div className="text-center text-red-400 py-4">{error}</div>
      )}

      {hasMore && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-black font-bold px-8 py-3 rounded-lg transition-colors"
          >
            {loading ? 'Cargando...' : 'Cargar más actualizaciones'}
          </button>
        </div>
      )}

      {!hasMore && updates.length > 0 && (
        <p className="text-center text-zinc-500 py-4">No hay más actualizaciones</p>
      )}
    </div>
  )
}
