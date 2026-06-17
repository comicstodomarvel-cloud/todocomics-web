import Link from 'next/link'
import { formatDateRelative } from '@/lib/dateUtils'
import type { Update } from '@/lib/types'

const ICONS: Record<string, string> = {
  volumen: '📚',
  correccion: '🔧',
  enlace_nuevo: '🔗',
  portada: '🖼️',
}

const LABELS: Record<string, string> = {
  volumen: 'Nuevo volumen',
  correccion: 'Corrección',
  enlace_nuevo: 'Nuevo enlace',
  portada: 'Portada actualizada',
}

export default function UpdateCard({ update }: { update: Update }) {
  const icon = ICONS[update.tipo] || '📢'
  const label = LABELS[update.tipo] || 'Actualización'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-amber-500 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">
              {label}
            </span>
            <span>{formatDateRelative(update.fecha)}</span>
          </div>

          {update.contenido && (
            <h3 className="font-bold text-lg text-zinc-100 truncate">
              {update.contenido.titulo}
            </h3>
          )}

          <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
            {update.titulo}
          </p>

          {update.descripcion && (
            <p className="text-zinc-500 text-xs mt-1 line-clamp-1">
              {update.descripcion}
            </p>
          )}

          {update.contenido && (
            <Link
              href={`/item/${update.contenido.id}`}
              className="text-amber-500 hover:text-amber-400 text-sm mt-2 inline-block"
            >
              Ver serie →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
