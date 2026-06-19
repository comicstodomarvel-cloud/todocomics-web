export const CATEGORIAS = ['Comic', 'Manga', 'Pelicula', 'Serie', 'Libro'] as const

export const HASHTAG_CATEGORIA: Record<string, (typeof CATEGORIAS)[number]> = {
  COMIC: 'Comic',
  MANGA: 'Manga',
  PELICULA: 'Pelicula',
  SERIE: 'Serie',
  SERIES: 'Serie',
  ANIME: 'Serie',
  LIBRO: 'Libro',
}

const CATEGORIA_HASHTAGS = new Set(Object.keys(HASHTAG_CATEGORIA).map((k) => k.toLowerCase()))

export function esCategoriaValida(hashtags: string[]): boolean {
  return hashtags.some((h) => CATEGORIA_HASHTAGS.has(h.toLowerCase()))
}

export const HASHTAG_FILTERS = [
  { id: 'marvel', label: 'Marvel', search: ['Marvel', 'marvel'] },
  { id: 'dc', label: 'DC', search: ['DC', 'dc'] },
  { id: 'starwars', label: 'Star Wars', search: ['StarWars', 'starwars'] },
  { id: 'darkhorse', label: 'Dark Horse', search: ['darkhorse'] },
  { id: 'image', label: 'Image', search: ['image'] },
  { id: 'valiant', label: 'Valiant', search: ['Valiant', 'valiant'] },
  { id: 'vertigo', label: 'Vertigo', search: ['Vertigo', 'vertigo'] },
  { id: 'topcow', label: 'Top Cow', search: ['TopCow', 'topcow'] },
  { id: 'dynamite', label: 'Dynamite', search: ['Dynamite', 'dynamite'] },
  { id: 'idw', label: 'IDW', search: ['IDW', 'idw'] },
  { id: 'boom', label: 'Boom!', search: ['Boom', 'boom'] },
  { id: 'manga', label: 'Mangas', search: ['Manga', 'manga'] },
  { id: 'anime', label: 'Anime', search: ['Anime', 'anime'] },
  { id: 'crossovers', label: 'Crossovers', search: ['Crossovers', 'crossovers'] },
  { id: 'libro', label: 'Libros', search: ['Libro', 'libro'] },
  { id: 'serie', label: 'Series', search: ['Serie', 'serie', 'Series', 'series'] },
  { id: 'pelicula', label: 'Películas', search: ['Pelicula', 'pelicula'] },
  { id: 'otros', label: 'Otros', search: ['otros'] },
] as const

export type HashtagFilterId = (typeof HASHTAG_FILTERS)[number]['id']
