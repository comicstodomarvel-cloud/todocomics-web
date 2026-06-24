import { getLatestContent, searchContent, getContentByCategoria, getContentByHashtag, getLatestUpdateDates, getBrokenLinkIds, getReportStatus } from '@/lib/data';
import type { ContentItem, SortOption } from '@/lib/data';
import { HASHTAG_FILTERS } from '@/lib/hashtags';
import SortSelect from '@/components/SortSelect';
import ViewModeToggle from '@/components/ViewModeToggle';
import LoadMoreButton from '@/components/LoadMoreButton';
import OnlineCounter from '@/components/OnlineCounter';
import ImageWithFallback from '@/components/ImageWithFallback';
import UpdatesWidget from '@/components/updates/UpdatesWidget';
import RandomRecommendation from '@/components/RandomRecommendation';
import FavoriteBadge from '@/components/FavoriteBadge';
import ReadLaterSection from '@/components/ReadLaterSection';
import TopWeekly from '@/components/TopWeekly';
import MobileActionBar from '@/components/MobileActionBar';
import HeroLogo from '@/components/HeroLogo';
import CatalogStats from '@/components/CatalogStats';

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

// Revalidar cada 5 minutos (300 segundos)
export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.com';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string; categoria?: string; hashtag?: string; vista?: string; orden?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { busqueda, categoria, hashtag } = params;

  let title = 'TodoComics - Catálogo Geek';
  let description =
    'Explora cómics, películas, series y libros del mundo geek. Tu catálogo personal estilo Netflix.';

  if (busqueda) {
    title = `"${busqueda}" - Resultados de búsqueda | TodoComics`;
    description = `Resultados de búsqueda para "${busqueda}" en TodoComics. Encuentra cómics, películas, series y más.`;
  } else if (categoria && categoria !== 'Todos') {
    title = `${categoria}s - Catálogo | TodoComics`;
    description = `Explora nuestra colección de ${categoria.toLowerCase()}s en TodoComics.`;
  } else if (hashtag) {
    const labelMap: Record<string, string> = {
      marvel: 'Marvel',
      dc: 'DC Comics',
      manga: 'Manga',
      anime: 'Anime',
      starwars: 'Star Wars',
    };
    const label = labelMap[hashtag] || hashtag;
    title = `Contenido de ${label} - TodoComics`;
    description = `Explora contenido relacionado con ${label} en TodoComics.`;
  }

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      title,
      description,
      siteName: 'TodoComics',
      url: siteUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string; categoria?: string; hashtag?: string; vista?: string; orden?: string }>;
}) {
  const params = await searchParams;
  const { busqueda, categoria, hashtag, vista, orden } = params;
  const sort: SortOption = (orden as SortOption) || 'reciente';
  const isFiltering = Boolean(busqueda || (categoria && categoria !== 'Todos') || hashtag);
  const viewMode = vista === 'lista' ? 'lista' : 'grid';

  // ✅ TIPO EXPLÍCITO para evitar error de TypeScript
  let content: ContentItem[] = [];

  // Obtener contenido según filtros
  if (hashtag) {
    content = await getContentByHashtag(hashtag, sort);
  } else if (busqueda) {
    content = await searchContent(busqueda, sort);
  } else if (categoria && categoria !== 'Todos') {
    content = await getContentByCategoria(categoria, sort);
  } else {
    content = await getLatestContent(20, sort);
  }

  // Manejar caso sin resultados
  if (content.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Sin resultados</h1>
            <p className="text-zinc-400 mb-6">
              {busqueda
                ? `No encontramos nada para "${busqueda}"`
                : hashtag
                ? `No hay contenido con ese filtro`
                : 'Aún no hay contenido en esta categoría'}
            </p>
            {busqueda && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-500">Sugerencias:</p>
                <ul className="text-sm text-zinc-500 space-y-1.5">
                  <li>• Revisá la ortografía del término buscado</li>
                  <li>• Probá con términos más generales</li>
                  <li>• Usá el nombre en inglés del cómic/película</li>
                </ul>
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {HASHTAG_FILTERS.slice(0, 8).map((f) => (
                <Link
                  key={f.id}
                  href={`/?hashtag=${f.id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full text-sm transition-colors"
                >
                  {f.label}
                </Link>
              ))}
            </div>
            <Link
              href="/"
              className="inline-block mt-6 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 🎲 Hero aleatorio
  const randomIndex = Math.floor(Math.random() * content.length);
  const heroItem = content[randomIndex];

  // Grid con TODOS los items (incluyendo el del Hero)
  const gridItems = content;

  // Fechas de última actualización para badges
  const updateDates = !busqueda && !categoria && !hashtag ? await getLatestUpdateDates() : {};

  // IDs de contenido con link caído verificado o reportado pendiente
  const { verificado: brokenIds, pendiente: reportedIds } = await getReportStatus();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: gridItems.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteUrl}/item/${item.id}`,
          })),
        }}
      />
      {/* Hero Section */}
      <section className="relative h-56 md:h-[70vh] w-full overflow-hidden">
        {/* Imagen de fondo con gradiente */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroItem.url_portada}
            alt={heroItem.titulo}
            fill
            className="object-cover"
            priority
          />
          {/* Gradiente oscuro para que el texto sea legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 via-[35%] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>

        <HeroLogo imageUrl={heroItem.url_portada} />

        {/* Contenido del Hero */}
        <div className="relative h-full hidden sm:flex items-end pb-16 px-8 md:px-16">
          <div className="max-w-2xl">
            {/* Badge de categoría */}
            <span className="inline-block bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded mb-4">
              {heroItem.categoria.toUpperCase()}
            </span>
            
            {/* Título */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {heroItem.titulo}
            </h1>
            
            {/* Descripción */}
            <p className="text-lg text-zinc-200 mb-6 line-clamp-3">
              {heroItem.descripcion}
            </p>
            
            {/* Hashtags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {heroItem.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-zinc-800/80 text-zinc-300 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Botón de descarga */}
            <a
              href={heroItem.link_descarga}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </a>
          </div>
        </div>
      </section>

      {!isFiltering && (
        <section className="container mx-auto px-4 py-8">
          {/* Acciones rápidas para móvil */}
          <div className="lg:hidden mb-4">
            <MobileActionBar />
          </div>

          <div className="flex gap-6">
            <TopWeekly />
            <div className="flex-1 min-w-0">
              <RandomRecommendation />
            </div>
          </div>
        </section>
      )}

      {/* Leer más tarde */}
      <ReadLaterSection />

      {/* Grid de contenido */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">
              {isFiltering
                ? busqueda
                  ? <>Resultados para <span className="text-amber-400">"{busqueda}"</span></>
                  : categoria && categoria !== 'Todos'
                  ? <>Categoría: <span className="text-amber-400">{categoria}</span></>
                  : <>Filtro aplicado</>
                : 'Continúa explorando'}
            </h2>
            {isFiltering && (
              <span className="text-sm text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
                {content.length} encontrados
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isFiltering && (
              <>
                <div className="hidden sm:flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 p-1 text-xs">
                  {[
                    { value: 'reciente', label: 'Nuevos' },
                    { value: 'antiguo', label: 'Antiguos' },
                    { value: 'az', label: 'A-Z' },
                    { value: 'za', label: 'Z-A' },
                  ].map((opt) => {
                    const sp = new URLSearchParams()
                    if (busqueda) sp.set('busqueda', busqueda)
                    if (categoria && categoria !== 'Todos') sp.set('categoria', categoria)
                    if (hashtag) sp.set('hashtag', hashtag)
                    if (vista) sp.set('vista', vista)
                    sp.set('orden', opt.value)
                    return (
                      <Link
                        key={opt.value}
                        href={`?${sp.toString()}`}
                        replace
                        className={`px-2.5 py-1.5 rounded-md transition-colors ${
                          (sort === opt.value) || (!orden && opt.value === 'reciente')
                            ? 'bg-amber-500 text-black font-bold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {opt.label}
                      </Link>
                    )
                  })}
                </div>
                <SortSelect
                  current={sort}
                  busqueda={busqueda}
                  categoria={categoria && categoria !== 'Todos' ? categoria : undefined}
                  hashtag={hashtag}
                  vista={vista}
                />
              </>
            )}
            <ViewModeToggle />
          </div>
        </div>
        <LoadMoreButton
          initialItems={gridItems}
          hasMorePages={!busqueda && !categoria && !hashtag}
          viewMode={viewMode}
          updateDates={updateDates}
          brokenIds={[...brokenIds]}
          reportedIds={[...reportedIds]}
          searchQuery={busqueda ?? ''}
          orden={sort}
        />
      </section>

      {/* Widget de actualizaciones */}
      <UpdatesWidget />

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <CatalogStats />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4 text-xs">
            <Link href="/dmca" className="text-zinc-500 hover:text-amber-400 transition-colors">
              DMCA
            </Link>
            <Link href="/faq" className="text-zinc-500 hover:text-amber-400 transition-colors">
              FAQ
            </Link>
            <Link href="/peticiones" className="text-zinc-500 hover:text-amber-400 transition-colors">
              Solicitar Cómic
            </Link>
          </div>

          <p>© 2026 TodoComics. Todos los derechos reservados.</p>
          <p className="text-xs text-zinc-500 mt-3 max-w-2xl mx-auto leading-relaxed">
            TodoComics es un sitio web que recopila y organiza enlaces de contenido
            disponible en fuentes públicas de internet. No almacenamos, alojamos ni
            distribuimos ningún archivo con derechos de autor en nuestros servidores.
            Todo el material compartido se encuentra originalmente en plataformas de
            terceros. Si eres titular de derechos y consideras que algún contenido
            infringe tus derechos, contáctanos para que podamos eliminar el enlace
            correspondiente.
          </p>
        </div>
      </footer>
    </div>
  );
}