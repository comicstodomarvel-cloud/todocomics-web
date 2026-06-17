import { supabase } from './supabase'

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
