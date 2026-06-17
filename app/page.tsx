import { getLatestContent, searchContent, getContentByCategoria, getLatestUpdateDates } from '@/lib/data';
import type { ContentItem } from '@/lib/data';
import ContentCard from '@/components/ContentCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ImageWithFallback from '@/components/ImageWithFallback';
import UpdatesWidget from '@/components/updates/UpdatesWidget';
import UpdatesDropdownButton from '@/components/updates/UpdatesDropdownButton';

// Revalidar cada 5 minutos (300 segundos)
export const revalidate = 300;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const { busqueda, categoria } = params;

  // ✅ TIPO EXPLÍCITO para evitar error de TypeScript
  let content: ContentItem[] = [];

  // Obtener contenido según filtros
  if (busqueda) {
    content = await searchContent(busqueda);
  } else if (categoria && categoria !== 'Todos') {
    content = await getContentByCategoria(categoria);
  } else {
    content = await getLatestContent(20);
  }

  // Manejar caso sin resultados
  if (content.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No hay contenido disponible</h1>
          <p className="text-zinc-400">
            {busqueda 
              ? `No encontramos resultados para "${busqueda}"`
              : 'Aún no hay contenido en esta categoría'}
          </p>
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
  const updateDates = !busqueda && !categoria ? await getLatestUpdateDates() : {};

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Botón dropdown de Updates */}
      <UpdatesDropdownButton />

      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
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

      {/* Buscador y Filtros */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <SearchBar />
          <CategoryFilter />
        </div>
      </section>

      {/* Grid de contenido */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold">Continúa explorando</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {gridItems.map((item) => (
            <ContentCard key={item.id} item={item} lastUpdateDate={updateDates[item.id]} />
          ))}
        </div>
      </section>

      {/* Widget de actualizaciones */}
      <UpdatesWidget />

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 TodoComics. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}