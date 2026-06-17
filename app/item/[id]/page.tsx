import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import { getContentById } from '@/lib/data'
import { mockData } from '@/data/mockData'

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let item = await getContentById(id).catch(() => null)

  if (!item) {
    item = mockData.find((m) => m.id === id) ?? null
  }

  if (!item) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto flex flex-col px-6 py-8 md:flex-row md:gap-10 md:px-16 md:py-12">
        <div className="relative mb-6 w-full shrink-0 md:mb-0 md:w-1/3">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
            <Image
              src={item.url_portada}
              alt={item.titulo}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <span className="mb-3 inline-block w-fit rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black">
            {item.categoria}
          </span>

          <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl">
            {item.titulo}
          </h1>

          <p className="mb-6 leading-relaxed text-zinc-300">
            {item.descripcion}
          </p>

          <div className="mb-8 flex flex-wrap gap-2">
            {item.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href={item.link_descarga}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
            >
              <ExternalLink size={18} />
              Descargar
            </a>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <ArrowLeft size={18} />
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
