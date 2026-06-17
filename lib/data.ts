import { supabase } from './supabase'
import { HASHTAG_FILTERS } from './hashtags'

export interface ContentItem {
  id: string
  titulo: string
  descripcion: string
  url_portada: string
  categoria: 'Comic' | 'Manga' | 'Pelicula' | 'Serie' | 'Libro'
  hashtags: string[]
  link_descarga: string
  fecha_creacion: string
}

export async function getLatestContent(limit = 10): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .order('fecha_creacion', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error al obtener contenido reciente:', error.message)
    throw new Error('Error al cargar contenido')
  }

  return (data as ContentItem[]) ?? []
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error al obtener contenido por ID:', error.message)
    throw new Error('Error al cargar contenido')
  }

  return data as ContentItem
}

export async function getContentByCategoria(
  categoria: string
): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .eq('categoria', categoria)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error al filtrar por categoría:', error.message)
    throw new Error('Error al cargar contenido')
  }

  return (data as ContentItem[]) ?? []
}

export async function searchContent(query: string): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error al buscar contenido:', error.message)
    throw new Error('Error al buscar contenido')
  }

  return (data as ContentItem[]) ?? []
}

export async function getLatestUpdateDates(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('actualizaciones')
    .select('contenido_id, fecha')
    .order('fecha', { ascending: false })

  if (error) {
    console.error('Error al obtener fechas de actualización:', error.message)
    return {}
  }

  const map: Record<string, string> = {}
  for (const item of data) {
    if (!map[item.contenido_id]) {
      map[item.contenido_id] = item.fecha
    }
  }
  return map
}

export async function getUpdatesForContent(contentId: string) {
  const { data, error } = await supabase
    .from('actualizaciones')
    .select('*')
    .eq('contenido_id', contentId)
    .order('fecha', { ascending: false })

  if (error) {
    console.error('Error al obtener actualizaciones:', error.message)
    return []
  }

  return data ?? []
}

export async function getFavoriteOfMonth(): Promise<{ item: ContentItem; visits: number } | null> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: visitData, error: visitError } = await supabase
    .from('visitas')
    .select('contenido_id')
    .gte('fecha', startOfMonth.toISOString())

  if (visitError) {
    console.error('Error al obtener visitas:', visitError.message)
    return null
  }

  if (!visitData || visitData.length === 0) {
    return null
  }

  const counts = new Map<string, number>()
  for (const v of visitData) {
    counts.set(v.contenido_id, (counts.get(v.contenido_id) || 0) + 1)
  }

  let topId = ''
  let topCount = 0
  for (const [id, count] of counts) {
    if (count > topCount) {
      topCount = count
      topId = id
    }
  }

  if (!topId) return null

  const item = await getContentById(topId)
  if (!item) return null

  return { item, visits: topCount }
}

export async function getContentByHashtag(hashtagId: string): Promise<ContentItem[]> {
  const filterDef = HASHTAG_FILTERS.find((f) => f.id === hashtagId)
  if (!filterDef) {
    console.error('Hashtag filter not found:', hashtagId)
    return []
  }

  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .overlaps('hashtags', filterDef.search)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error al filtrar por hashtag:', error.message)
    throw new Error('Error al cargar contenido')
  }

  return (data as ContentItem[]) ?? []
}
