import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import UpdateBadge from './updates/UpdateBadge'
import ReadLaterButton from './ReadLaterButton'
import ReportBadge from './ReportBadge'
import type { ContentItem } from '@/lib/data'

interface ContentCardProps {
  item: ContentItem
  lastUpdateDate?: string
  linkCaido?: boolean
}

export default function ContentCard({ item, lastUpdateDate, linkCaido }: ContentCardProps) {
  return (
    <div className="group relative block">
      <Link href={`/item/${item.id}`}>
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800">
          {lastUpdateDate && <UpdateBadge updateDate={lastUpdateDate} />}
          {linkCaido && <ReportBadge />}
          <ImageWithFallback
            src={item.url_portada}
            alt={item.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 card-overlay transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 mb-1 sm:mb-2">
                {item.titulo}
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded text-xs min-h-[22px] flex items-center">
                  {item.categoria}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <ReadLaterButton contenidoId={item.id} />
    </div>
  )
}
