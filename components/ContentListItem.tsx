import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import UpdateBadge from './updates/UpdateBadge'
import ReportBadge from './ReportBadge'
import ReportedBadge from './ReportedBadge'
import ReadLaterButton from './ReadLaterButton'
import LikeButton from './LikeButton'
import type { ContentItem } from '@/lib/data'

function highlightText(text: string, query: string) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-amber-500/30 text-amber-200 rounded-sm px-0.5">{part}</mark>
      : part
  )
}

interface ContentListItemProps {
  item: ContentItem
  lastUpdateDate?: string
  linkCaido?: boolean
  linkReportado?: boolean
  searchQuery?: string
}

function extractYear(titulo: string): string | null {
  const match = titulo.match(/\|\s*(\d{4})\s*\|/)
  return match ? match[1] : null
}

export default function ContentListItem({ item, lastUpdateDate, linkCaido, linkReportado, searchQuery = '' }: ContentListItemProps) {
  const year = extractYear(item.titulo)

  return (
    <div className="group relative flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <Link href={`/item/${item.id}`} className="shrink-0">
        <div className="relative h-24 w-16 overflow-hidden rounded-md bg-zinc-800">
          <ImageWithFallback
            src={item.url_portada}
            alt={item.titulo}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link href={`/item/${item.id}`} className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
            {highlightText(item.titulo, searchQuery)}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400 uppercase">
              {item.categoria}
            </span>
            {year && <span className="text-zinc-500">{year}</span>}
            {lastUpdateDate && <UpdateBadge updateDate={lastUpdateDate} />}
            {linkCaido && <ReportBadge />}
            {!linkCaido && linkReportado && <ReportedBadge />}
          </div>
        </Link>

        {item.descripcion && (
          <p className="line-clamp-2 text-xs text-zinc-600 leading-relaxed">
            {highlightText(item.descripcion, searchQuery)}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {item.hashtags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex flex-row sm:hidden items-center gap-2 pt-1">
          <ReadLaterButton contenidoId={item.id} />
          <LikeButton contenidoId={item.id} />
        </div>
      </div>

      <div className="hidden sm:flex flex-col gap-1.5 shrink-0">
        <ReadLaterButton contenidoId={item.id} />
        <LikeButton contenidoId={item.id} />
      </div>
    </div>
  )
}
