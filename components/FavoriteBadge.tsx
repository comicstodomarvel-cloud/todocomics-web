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
        className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-[#ff8c00] hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(255,140,0,0.4)] hover:bg-zinc-800/40 transition-all duration-200"
      >
        <Crown size={18} className="text-amber-400" />
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
