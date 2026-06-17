'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'

function getSavedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('readLater')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function toggleId(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter((i) => i !== id)
  return [...ids, id]
}

export default function ReadLaterButton({ contenidoId }: { contenidoId: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(getSavedIds().includes(contenidoId))
  }, [contenidoId])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const ids = toggleId(getSavedIds(), contenidoId)
    localStorage.setItem('readLater', JSON.stringify(ids))
    setSaved(ids.includes(contenidoId))
    window.dispatchEvent(new Event('readLaterChanged'))
  }

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
        saved
          ? 'bg-amber-500 text-black shadow-md'
          : 'bg-black/50 text-zinc-300 hover:bg-zinc-800'
      }`}
      aria-label={saved ? 'Quitar de Leer más tarde' : 'Guardar para Leer más tarde'}
    >
      <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
