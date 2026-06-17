import Image from 'next/image'
import { getLatestContent, getContentByCategoria, searchContent } from '@/lib/data'
import ContentCard from '@/components/ContentCard'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import { mockData } from '@/data/mockData'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string; categoria?: string }>
}) {
  const { busqueda, categoria } = await searchParams

  let items: typeof mockData

  if (busqueda) {
    items = await searchContent(busqueda).catch(() => [])
  } else if (categoria) {
    items = await getContentByCategoria(categoria).catch(() => [])
  } else {
    items = await getLatestContent(10).catch(() => [])
  }

  if (items.length === 0) {
    items = mockData
  }

// Seleccionar un item aleatorio para el Hero
const randomIndex = Math.floor(Math.random() * content.length);
const heroItem = content[randomIndex];

// El grid muestra TODOS los items (incluyendo el del Hero)
const gridItems = content;

  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] w-full">
        <Image
          src={hero.url_portada}
          alt={hero.titulo}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
          <span className="mb-3 inline-block rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black">
            {hero.categoria}
          </span>
          <h1 className="mb-2 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {hero.titulo}
          </h1>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            {hero.descripcion}
          </p>
          <div className="flex flex-wrap gap-2">
            {hero.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300 backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5 px-6 pb-12 pt-8 sm:px-10 md:px-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white">
            {busqueda
              ? `Resultados para "${busqueda}"`
              : categoria
                ? categoria
                : 'Continúa explorando'}
          </h2>
          <SearchBar />
        </div>

        <CategoryFilter />

        {grid.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {grid.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-zinc-500">
            No se encontró contenido con los filtros seleccionados.
          </p>
        )}
      </section>
    </>
  )
}
