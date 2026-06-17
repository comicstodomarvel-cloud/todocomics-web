import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDateRelative } from '@/lib/dateUtils'
import type { Update } from '@/lib/types'

const ICONS: Record<string, string> = {
  volumen: '📚',
  correccion: '🔧',
  enlace_nuevo: '🔗',
  portada: '🖼️',
}

export default async function UpdatesWidget() {
  const { data: updates, error } = await supabase
    .from('actualizaciones')
    .select(`
      *,
      contenido:contenido_id (
        id,
        titulo,
        categoria,
        url_portada
      )
    `)
    .order('fecha', { ascending: false })
    .limit(5)

  if (error || !updates || updates.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Últimas Actualizaciones</h2>
        <Link
          href="/updates"
          className="text-amber-500 hover:text-amber-400 text-sm font-medium"
        >
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {(updates as unknown as Update[]).map((update) => (
          <div
            key={update.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-amber-500 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="text-xl flex-shrink-0">
                {ICONS[update.tipo] || '📢'}
              </div>
              <div className="flex-1 min-w-0">
                {update.contenido && (
                  <Link
                    href={`/item/${update.contenido.id}`}
                    className="font-semibold text-sm text-zinc-100 hover:text-amber-400 transition-colors line-clamp-2"
                  >
                    {update.contenido.titulo}
                  </Link>
                )}
                <p className="text-xs text-zinc-500 mt-1">
                  {formatDateRelative(update.fecha)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
