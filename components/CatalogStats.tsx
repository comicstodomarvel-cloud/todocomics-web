import { getCatalogStats } from '@/lib/data'

const CATEGORY_LABELS: Record<string, string> = {
  Comic: 'Cómics',
  Manga: 'Mangas',
  Pelicula: 'Películas',
  Serie: 'Series',
  Libro: 'Libros',
}

export default async function CatalogStats() {
  const stats = await getCatalogStats()

  if (!stats) return null

  const items = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => `${count.toLocaleString()} ${CATEGORY_LABELS[cat] || cat}`)

  return (
    <p className="text-xs text-zinc-600 mb-4">
      📚 {stats.total.toLocaleString()} títulos en catálogo
      {items.length > 0 && <> · {items.join(' · ')}</>}
    </p>
  )
}
