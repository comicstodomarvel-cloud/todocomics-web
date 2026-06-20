import Link from 'next/link'
import type { Metadata } from 'next'
import ImageWithFallback from '@/components/ImageWithFallback'
import { notFound } from 'next/navigation'
import { ExternalLink, ArrowLeft, AlertTriangle, Share2 } from 'lucide-react'
import { getContentById, getItemReportStatus } from '@/lib/data'
import { mockData } from '@/data/mockData'
import VisitTracker from '@/components/VisitTracker'
import JsonLd from '@/components/JsonLd'
import RelatedContent from '@/components/RelatedContent'
import RatingWidget from '@/components/RatingWidget'
import CommentSection from '@/components/CommentSection'
import ReportBrokenLink from '@/components/ReportBrokenLink'
import ShareButton from '@/components/ShareButton'
import LikeButton from '@/components/LikeButton'
import Breadcrumbs from '@/components/Breadcrumbs'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  let item = await getContentById(id).catch(() => null)
  if (!item) item = mockData.find((m) => m.id === id) ?? null
  if (!item) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.com'
  const imageUrl = item.url_portada?.startsWith('http') ? item.url_portada : `${siteUrl}/og-default.jpg`

  return {
    title: `${item.titulo} — TodoComics`,
    description: item.descripcion?.slice(0, 200) || `Explora ${item.titulo} en TodoComics`,
    alternates: {
      canonical: `${siteUrl}/item/${id}`,
    },
    openGraph: {
      title: item.titulo,
      description: item.descripcion?.slice(0, 200) || `Explora ${item.titulo} en TodoComics`,
      type: 'article',
      siteName: 'TodoComics',
      url: `${siteUrl}/item/${id}`,
      images: [{ url: imageUrl, width: 1200, height: 1800 }],
      publishedTime: item.fecha_creacion,
      tags: item.hashtags,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.titulo,
      description: item.descripcion?.slice(0, 200) || `Explora ${item.titulo} en TodoComics`,
      images: [imageUrl],
    },
  }
}

export default async function ItemPage({
  params,
}: Props) {
  try {
    const { id } = await params
    let item = await getContentById(id).catch(() => null)

    if (!item) {
      item = mockData.find((m) => m.id === id) ?? null
    }

    if (!item) {
      notFound()
    }

    const safeHashtags = Array.isArray(item.hashtags) ? item.hashtags : []
    const reportStatus = await getItemReportStatus(item.id)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.com'
    const shareUrl = `${siteUrl}/item/${id}`

    return (
      <div className="min-h-screen bg-zinc-950">
        <VisitTracker contenidoId={item.id} />
        <div className="px-6 pt-6 md:px-16 md:pt-8">
          <Breadcrumbs
            items={[
              { label: item.categoria, href: `/?categoria=${encodeURIComponent(item.categoria)}` },
              { label: item.titulo },
            ]}
          />
        </div>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: item.titulo,
            description: item.descripcion?.slice(0, 200),
            image: item.url_portada,
            datePublished: item.fecha_creacion,
            author: {
              "@type": "Organization",
              name: "TodoComics",
            },
            about: {
              "@type": "Thing",
              name: item.categoria,
            },
            keywords: item.hashtags?.join(", "),
          }}
        />
        <div className="mx-auto flex flex-col px-6 py-8 md:flex-row md:gap-10 md:px-16 md:py-12">
          <div className="relative mb-6 w-full shrink-0 md:mb-0 md:w-1/3">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
              <ImageWithFallback
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
              {safeHashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <RatingWidget contenidoId={item.id} />

            <div className="mb-4">
              <LikeButton contenidoId={item.id} />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={item.link_descarga}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
              >
                <ExternalLink size={18} />
                Descargar
              </a>

              <ReportBrokenLink contenidoId={item.id} reportStatus={reportStatus} />

              <ShareButton titulo={item.titulo} url={shareUrl} />

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

        <section className="px-6 md:px-16 pb-12">
          <CommentSection contenidoId={item.id} />
        </section>

        <RelatedContent currentId={item.id} hashtags={safeHashtags} categoria={item.categoria} />
      </div>
    )
  } catch (error) {
    console.error('Error rendering ItemPage:', error)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <p className="text-lg text-zinc-400 mb-2">Error al cargar el contenido</p>
          <p className="text-sm text-zinc-600 mb-6">
            Ocurrió un error inesperado. Intenta recargar la página.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <ArrowLeft size={18} />
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }
}
