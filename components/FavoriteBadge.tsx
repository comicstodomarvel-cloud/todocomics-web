import Link from 'next/link'
import { getFavoriteOfMonth } from '@/lib/data'
import { Crown } from 'lucide-react'

export default async function FavoriteBadge() {
  const favorite = await getFavoriteOfMonth()

  if (!favorite) return null

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
