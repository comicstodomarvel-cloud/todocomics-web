import Link from 'next/link'
import { getFavoriteOfMonth } from '@/lib/data'
import { Crown } from 'lucide-react'

export default async function FavoriteBadge({ variant = 'default' }: { variant?: 'default' | 'toolbar' }) {
  const favorite = await getFavoriteOfMonth()

  if (!favorite) return null

  if (variant === 'toolbar') {
    return (
      <Link
        href={`/item/${favorite.item.id}`}
        className="group relative flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 text-xs hover:border-amber-500/60 hover:bg-amber-500/15 transition-all duration-200 shrink-0"
      >
        <Crown size={14} className="text-amber-400 shrink-0" />
        <span className="text-zinc-200 font-medium truncate max-w-[90px] leading-tight">
          {favorite.item.titulo}
        </span>
        <span className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-50 animate-fade-in bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
          Favorito del Mes
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/item/${favorite.item.id}`}
      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 px-4 py-2.5 transition-all hover:border-amber-500/60 hover:bg-amber-500/15 shrink-0"
    >
      <Crown size={18} className="text-amber-400 shrink-0" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold leading-tight">
          Favorito del Mes
        </span>
        <span className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors leading-tight truncate max-w-[160px]">
          {favorite.item.titulo}
        </span>
      </div>
      <span className="text-[10px] text-zinc-500 ml-auto shrink-0">
        {favorite.visits} visitas
      </span>
    </Link>
  )
}
