'use client'

import { X } from 'lucide-react'
import { HASHTAG_FILTERS } from '@/lib/hashtags'

export default function HashtagFilterPanel({
  activeHashtag,
  onSelect,
  onClose,
}: {
  activeHashtag: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-lg">Filtrar por categoría</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/20 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onSelect('')}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              !activeHashtag
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Todos
          </button>
          {HASHTAG_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                activeHashtag === cat.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
