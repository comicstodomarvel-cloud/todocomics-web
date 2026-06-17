import { getLatestContent, searchContent, getContentByCategoria } from '@/lib/data';
import type { ContentItem } from '@/lib/data';
import { ContentCard } from '@/components/ContentCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';

export const revalidate = 300;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const { busqueda, categoria } = params;

  // ✅ AHORA SÍ TIENE TIPO EXPLÍCITO
  let content: ContentItem[] = [];
  
  if (busqueda) {
    content = await searchContent(busqueda);
  } else if (categoria && categoria !== 'Todos') {
    content = await getContentByCategoria(categoria);
  } else {
    content = await getLatestContent(20);
  }

  if (content.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-xl">No hay contenido disponible</p>
      </div>
    );
  }

  // Hero aleatorio
  const randomIndex = Math.floor(Math.random() * content.length);
  const heroItem = content[randomIndex];
  
  // Grid con TODOS los items
  const gridItems = content;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        {/* ... tu código del Hero con heroItem ... */}
      </section>

      {/* Buscador y Filtros */}
      <SearchBar />
      <CategoryFilter />

      {/* Grid de contenido */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold">Continúa explorando</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {gridItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}