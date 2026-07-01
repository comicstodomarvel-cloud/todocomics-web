import { supabase } from './supabase'
import { HASHTAG_FILTERS } from './hashtags'

export interface ContentItem {
  id: string
  titulo: string
  descripcion: string
  url_portada: string
  categoria: 'Comic' | 'Manga' | 'Pelicula' | 'Serie' | 'Anime' | 'Libro'
  hashtags: string[]
  link_descarga: string
  fecha_creacion: string
}

export type SortOption = 'reciente' | 'antiguo' | 'az' | 'za'

function buildOrder(sort: SortOption): { column: string; ascending: boolean } {
  switch (sort) {
    case 'reciente': return { column: 'fecha_creacion', ascending: false }
    case 'antiguo': return { column: 'fecha_creacion', ascending: true }
    case 'az': return { column: 'titulo', ascending: true }
    case 'za': return { column: 'titulo', ascending: false }
  }
}

export async function getLatestContent(limit = 10, sort: SortOption = 'reciente'): Promise<ContentItem[]> {
  const order = buildOrder(sort)
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .order(order.column, { ascending: order.ascending })
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
  categoria: string,
  sort: SortOption = 'reciente'
): Promise<ContentItem[]> {
  const order = buildOrder(sort)
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .eq('categoria', categoria)
    .order(order.column, { ascending: order.ascending })

  if (error) {
    console.error('Error al filtrar por categoría:', error.message)
    throw new Error('Error al cargar contenido')
  }

  return (data as ContentItem[]) ?? []
}

export async function searchContent(query: string, sort: SortOption = 'reciente'): Promise<ContentItem[]> {
  const order = buildOrder(sort)
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
    .order(order.column, { ascending: order.ascending })

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

export async function getCatalogStats(): Promise<{ total: number; byCategory: Record<string, number> } | null> {
  const { data, error } = await supabase
    .from('contenido')
    .select('categoria')

  if (error) {
    console.error('Error al obtener estadísticas:', error.message)
    return null
  }

  if (!data || data.length === 0) return null

  const byCategory: Record<string, number> = {}
  for (const item of data) {
    byCategory[item.categoria] = (byCategory[item.categoria] || 0) + 1
  }

  return { total: data.length, byCategory }
}

export async function getContentByIds(ids: string[]): Promise<ContentItem[]> {
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .in('id', ids)

  if (error) {
    console.error('Error al obtener contenido por IDs:', error.message)
    return []
  }

  return (data as ContentItem[]) ?? []
}

export async function getRelatedContent(
  contenidoId: string,
  hashtags: string[],
  limit = 6
): Promise<ContentItem[]> {
  if (hashtags.length === 0) return []

  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .neq('id', contenidoId)
    .overlaps('hashtags', hashtags)
    .limit(limit)

  if (error) {
    console.error('Error al obtener contenido relacionado:', error.message)
    return []
  }

  return (data as ContentItem[]) ?? []
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

export async function getBrokenLinkIds(): Promise<Set<string>> {
  const { data } = await supabase
    .from('reportes_links')
    .select('contenido_id')
    .eq('estado', 'verificado')

  return new Set(data?.map((r) => r.contenido_id) ?? [])
}

export async function getReportStatus(): Promise<{
  verificado: Set<string>
  pendiente: Set<string>
}> {
  const { data } = await supabase
    .from('reportes_links')
    .select('contenido_id, estado')
    .in('estado', ['pendiente', 'verificado'])

  const verificado = new Set<string>()
  const pendiente = new Set<string>()

  for (const r of data ?? []) {
    if (r.estado === 'verificado') verificado.add(r.contenido_id)
    else if (r.estado === 'pendiente') pendiente.add(r.contenido_id)
  }

  return { verificado, pendiente }
}

export async function getItemReportStatus(
  contenidoId: string
): Promise<'none' | 'pendiente' | 'verificado' | 'resuelto'> {
  const { data } = await supabase
    .from('reportes_links')
    .select('estado')
    .eq('contenido_id', contenidoId)

  if (!data || data.length === 0) return 'none'

  const estados = new Set(data.map((r) => r.estado))
  if (estados.has('verificado')) return 'verificado'
  if (estados.has('pendiente')) return 'pendiente'
  if (estados.has('resuelto')) return 'resuelto'
  return 'none'
}

export async function checkDuplicates(
  titulo: string
): Promise<Pick<ContentItem, 'id' | 'titulo' | 'fecha_creacion'>[]> {
  const segmento = titulo.split('│')[0].trim()
  if (!segmento) return []
  const { data } = await supabase
    .from('contenido')
    .select('id, titulo, fecha_creacion')
    .ilike('titulo', `%${segmento}%`)
    .order('fecha_creacion', { ascending: false })
    .limit(5)
  return (data ?? []) as any
}

export async function getContentByHashtag(hashtagId: string, sort: SortOption = 'reciente'): Promise<ContentItem[]> {
  const filterDef = HASHTAG_FILTERS.find((f) => f.id === hashtagId)
  if (!filterDef) {
    console.error('Hashtag filter not found:', hashtagId)
    return []
  }

  const order = buildOrder(sort)
  const { data, error } = await supabase
    .from('contenido')
    .select('*')
    .overlaps('hashtags', filterDef.search)
    .order(order.column, { ascending: order.ascending })

  if (error) {
    console.error('Error al filtrar por hashtag:', error.message)
    throw new Error('Error al cargar contenido')
  }

  return (data as ContentItem[]) ?? []
}
