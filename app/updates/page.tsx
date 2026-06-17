import { supabase } from '@/lib/supabase'
import UpdatesFeed from '@/components/updates/UpdatesFeed'
import type { Update } from '@/lib/types'

export const revalidate = 60

export default async function UpdatesPage() {
  const { data: updates, error, count } = await supabase
    .from('actualizaciones')
    .select(`
      *,
      contenido:contenido_id (
        id,
        titulo,
        categoria,
        url_portada
      )
    `, { count: 'exact' })
    .order('fecha', { ascending: false })
    .range(0, 19)

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error al cargar</h1>
          <p className="text-zinc-400">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!updates || updates.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No hay actualizaciones</h1>
          <p className="text-zinc-400">Aún no se han registrado actualizaciones</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Últimas Actualizaciones</h1>
        <p className="text-zinc-400 mb-8">
          Mantente al día con los últimos contenidos actualizados
        </p>

        <UpdatesFeed
          initialUpdates={updates as unknown as Update[]}
          initialTotal={count ?? 0}
        />
      </div>

      <footer className="bg-zinc-900 text-zinc-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 TodoComics. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
