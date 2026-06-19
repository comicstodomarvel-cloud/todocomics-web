import { getLatestContent, searchContent, getContentByCategoria, getContentByHashtag, getLatestUpdateDates, getBrokenLinkIds, getReportStatus } from '@/lib/data';
import type { ContentItem } from '@/lib/data';
import ContentCard from '@/components/ContentCard';
import ContentListItem from '@/components/ContentListItem';
import ViewModeToggle from '@/components/ViewModeToggle';
import LoadMoreButton from '@/components/LoadMoreButton';
import SearchBar from '@/components/SearchBar';
import OnlineCounter from '@/components/OnlineCounter';
import HashtagFilter from '@/components/HashtagFilter';
import ImageWithFallback from '@/components/ImageWithFallback';
import UpdatesWidget from '@/components/updates/UpdatesWidget';
import UpdatesDropdownButton from '@/components/updates/UpdatesDropdownButton';
import RandomRecommendation from '@/components/RandomRecommendation';
import FavoriteBadge from '@/components/FavoriteBadge';
import ReadLaterSection from '@/components/ReadLaterSection';
import CatalogStats from '@/components/CatalogStats';
import FavoritosSection from '@/components/FavoritosSection';

// Revalidar cada 5 minutos (300 segundos)
export const revalidate = 300;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string; categoria?: string; hashtag?: string; vista?: string }>;
}) {
  const params = await searchParams;
  const { busqueda, categoria, hashtag, vista } = params;
  const viewMode = vista === 'lista' ? 'lista' : 'grid';

  // ✅ TIPO EXPLÍCITO para evitar error de TypeScript
  let content: ContentItem[] = [];

  // Obtener contenido según filtros
  if (hashtag) {
    content = await getContentByHashtag(hashtag);
  } else if (busqueda) {
    content = await searchContent(busqueda);
  } else if (categoria && categoria !== 'Todos') {
    content = await getContentByCategoria(categoria);
  } else {
    content = await getLatestContent(20);
  }

  // Manejar caso sin resultados
  if (content.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <UpdatesDropdownButton />
        <HashtagFilter />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">No hay contenido disponible</h1>
            <p className="text-zinc-400">
              {busqueda
                ? `No encontramos resultados para "${busqueda}"`
                : hashtag
                ? `No encontramos contenido con ese filtro`
                : 'Aún no hay contenido en esta categoría'}
            </p>
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
      {/* Botón dropdown de Updates */}
      <UpdatesDropdownButton />
      {/* Botón flotante de filtros por hashtag */}
      <HashtagFilter />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:h-[70vh] w-full overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent" />
        </div>

        {/* Contenido del Hero */}
        <div className="relative h-full flex items-end pb-16 px-8 md:px-16">
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

      {/* Recomendación aleatoria */}
      <section className="container mx-auto px-4 py-8">
        <RandomRecommendation />
      </section>

      {/* Buscador y Favorito del Mes */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <SearchBar />
          <div className="flex items-center gap-3">
            <FavoriteBadge />
            <OnlineCounter />
          </div>
        </div>
      </section>

      {/* Leer más tarde */}
      <ReadLaterSection />

      {/* Favoritos */}
      <FavoritosSection
        viewMode={viewMode}
        updateDates={updateDates}
        brokenIds={[...brokenIds]}
        reportedIds={[...reportedIds]}
      />

      {/* Grid de contenido */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Continúa explorando</h2>
          <ViewModeToggle />
        </div>
        {viewMode === 'lista' ? (
          <div className="space-y-3">
            {gridItems.map((item) => (
              <ContentListItem key={item.id} item={item} lastUpdateDate={updateDates[item.id]} linkCaido={brokenIds.has(item.id)} linkReportado={reportedIds.has(item.id)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {gridItems.map((item) => (
              <ContentCard key={item.id} item={item} lastUpdateDate={updateDates[item.id]} linkCaido={brokenIds.has(item.id)} linkReportado={reportedIds.has(item.id)} />
            ))}
          </div>
        )}

        <LoadMoreButton
          viewMode={viewMode}
          updateDates={updateDates}
          brokenIds={[...brokenIds]}
          reportedIds={[...reportedIds]}
        />
      </section>

      {/* Widget de actualizaciones */}
      <UpdatesWidget />

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <CatalogStats />
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