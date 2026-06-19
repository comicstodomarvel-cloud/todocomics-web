import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import UpdateBadge from './updates/UpdateBadge'
import ReportBadge from './ReportBadge'
import ReportedBadge from './ReportedBadge'
import ReadLaterButton from './ReadLaterButton'
import FavoritoButton from './FavoritoButton'
import type { ContentItem } from '@/lib/data'

interface ContentListItemProps {
  item: ContentItem
  lastUpdateDate?: string
  linkCaido?: boolean
  linkReportado?: boolean
}

function extractYear(titulo: string): string | null {
  const match = titulo.match(/\|\s*(\d{4})\s*\|/)
  return match ? match[1] : null
}

export default function ContentListItem({ item, lastUpdateDate, linkCaido, linkReportado }: ContentListItemProps) {
  const year = extractYear(item.titulo)

  return (
    <div className="group relative flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900">
      <Link href={`/item/${item.id}`} className="shrink-0">
        <div className="relative h-20 w-14 overflow-hidden rounded-md bg-zinc-800">
          <ImageWithFallback
            src={item.url_portada}
            alt={item.titulo}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link href={`/item/${item.id}`} className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
            {item.titulo}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400 uppercase">
              {item.categoria}
            </span>
            {year && <span>{year}</span>}
            {lastUpdateDate && <UpdateBadge updateDate={lastUpdateDate} />}
          </div>
        </Link>

        <div className="shrink-0">
          {linkCaido && <ReportBadge />}
          {!linkCaido && linkReportado && <ReportedBadge />}
        </div>
      </div>

      <ReadLaterButton contenidoId={item.id} />
      <FavoritoButton contenidoId={item.id} />
    </div>
  )
}
