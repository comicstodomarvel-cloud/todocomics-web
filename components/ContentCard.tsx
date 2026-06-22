import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import UpdateBadge from './updates/UpdateBadge'
import ReadLaterButton from './ReadLaterButton'
import LikeButton from './LikeButton'
import ReportBadge from './ReportBadge'
import ReportedBadge from './ReportedBadge'
import type { ContentItem } from '@/lib/data'

function getPublisher(hashtags: string[]): 'marvel' | 'dc' | null {
  if (hashtags.some(h => h.toLowerCase() === 'marvel')) return 'marvel'
  if (hashtags.some(h => h.toLowerCase() === 'dc' || h.toLowerCase() === 'dc comics')) return 'dc'
  return null
}

function highlightText(text: string, query: string) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-amber-500/30 text-amber-200 rounded-sm px-0.5">{part}</mark>
      : part
  )
}

interface ContentCardProps {
  item: ContentItem
  lastUpdateDate?: string
  linkCaido?: boolean
  linkReportado?: boolean
  searchQuery?: string
}

export default function ContentCard({ item, lastUpdateDate, linkCaido, linkReportado, searchQuery = '' }: ContentCardProps) {
  const publisher = getPublisher(item.hashtags)

  return (
    <div className={`group relative block ${publisher ?? ''}`}>
      <Link href={`/item/${item.id}`}>
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 transition-all duration-300 ease-in-out">
          {lastUpdateDate && <UpdateBadge updateDate={lastUpdateDate} />}
          {linkCaido && <ReportBadge />}
          {!linkCaido && linkReportado && <ReportedBadge />}
          <ImageWithFallback
            src={item.url_portada}
            alt={item.titulo}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 card-overlay transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 mb-1 sm:mb-2">
                {highlightText(item.titulo, searchQuery)}
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

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ReadLaterButton contenidoId={item.id} />
        <LikeButton contenidoId={item.id} />
      </div>
    </div>
  )
}
