import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: items } = await supabase
    .from('contenido')
    .select('id, fecha_creacion')
    .order('fecha_creacion', { ascending: false })

  const contentUrls =
    items?.map((item) => ({
      url: `${siteUrl}/item/${item.id}`,
      lastModified: item.fecha_creacion,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) ?? []

  const categories = ['Comic', 'Manga', 'Pelicula', 'Serie', 'Anime', 'Libro']
  const categoryUrls = categories.map((cat) => ({
    url: `${siteUrl}/?categoria=${encodeURIComponent(cat)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/updates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    ...categoryUrls,
    ...contentUrls,
  ]
}
