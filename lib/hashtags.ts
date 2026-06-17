export const CATEGORIAS = ['Comic', 'Manga', 'Pelicula', 'Serie', 'Libro'] as const

export const HASHTAG_CATEGORIA: Record<string, (typeof CATEGORIAS)[number]> = {
  COMIC: 'Comic',
  MANGA: 'Manga',
  PELICULA: 'Pelicula',
  SERIE: 'Serie',
  LIBRO: 'Libro',
}

const CATEGORIA_HASHTAGS = new Set(Object.keys(HASHTAG_CATEGORIA).map((k) => k.toLowerCase()))

export function esCategoriaValida(hashtags: string[]): boolean {
  return hashtags.some((h) => CATEGORIA_HASHTAGS.has(h.toLowerCase()))
}
