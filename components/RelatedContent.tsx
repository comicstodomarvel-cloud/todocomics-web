import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import { getRelatedContent } from '@/lib/data'

interface RelatedContentProps {
  currentId: string
  hashtags: string[]
  categoria: string
}

export default async function RelatedContent({
  currentId,
  hashtags,
  categoria,
}: RelatedContentProps) {
  const safeHashtags = Array.isArray(hashtags) ? hashtags : []
  const related = await getRelatedContent(currentId, safeHashtags, 6)

  if (related.length === 0) return null

  return (
    <section className="border-t border-zinc-800 mt-12 pt-8 px-6 md:px-16">
      <h2 className="text-xl font-bold text-zinc-100 mb-5">
        🔥 También te puede interesar
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {related.map((item) => (
          <Link
            key={item.id}
            href={`/item/${item.id}`}
            className="group block"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800">
              <ImageWithFallback
                src={item.url_portada}
                alt={item.titulo}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 card-overlay transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-bold text-white line-clamp-2">
                    {item.titulo}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
