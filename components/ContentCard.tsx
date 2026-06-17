import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import type { ContentItem } from '@/lib/data'

interface ContentCardProps {
  item: ContentItem
}

export default function ContentCard({ item }: ContentCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-zinc-800 transition-transform duration-300 hover:scale-105">
      <div className="relative aspect-[2/3] w-full">
        <ImageWithFallback
          src={item.url_portada}
          alt={item.titulo}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="mb-2 rounded-full bg-amber-500/90 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-black">
          {item.categoria}
        </span>
        <h3 className="mb-3 text-center text-sm font-bold leading-tight text-white">
          {item.titulo}
        </h3>
        <Link
          href={`/item/${item.id}`}
          className="w-full rounded-md bg-white/20 px-4 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  )
}
