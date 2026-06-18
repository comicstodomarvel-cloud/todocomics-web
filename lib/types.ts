export type UpdateTipo = 'volumen' | 'correccion' | 'enlace_nuevo' | 'portada'

export interface Update {
  id: string
  contenido_id: string | null
  titulo: string
  descripcion: string | null
  tipo: UpdateTipo
  fecha: string
  telegram_message_id: number | null
  metadata: {
    link_post_original?: string
    portada_url?: string
    es_huerfano?: boolean
  }
  contenido?: {
    id: string
    titulo: string
    categoria: string
    url_portada: string | null
  } | null
}

export interface Comment {
  id: string
  contenido_id: string
  nickname: string
  contenido: string
  fecha: string
  likes?: number
  dislikes?: number
  miVoto?: 'like' | 'dislike' | null
}
