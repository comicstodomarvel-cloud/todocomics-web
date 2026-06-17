import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface TelegramUpdate {
  update_id: number
  channel_post?: TelegramMessage
  message?: TelegramMessage
}

interface TelegramMessage {
  message_id: number
  chat: { id: number; type: string }
  text?: string
  caption?: string
  photo?: { file_id: string; file_unique_id: string; file_size?: number; width?: number; height?: number }[]
  date: number
}

interface ParsedContent {
  titulo: string
  descripcion: string
  url_portada: string
  categoria: string
  hashtags: string[]
  link_descarga: string
}

/**
 * Categorías válidas en la base de datos.
 */
const CATEGORIAS = ['Comic', 'Manga', 'Pelicula', 'Serie', 'Libro'] as const

/**
 * Traducción de hashtags a categorías normalizadas.
 */
const HASHTAG_CATEGORIA: Record<string, (typeof CATEGORIAS)[number]> = {
  COMIC: 'Comic',
  MANGA: 'Manga',
  PELICULA: 'Pelicula',
  SERIE: 'Serie',
  LIBRO: 'Libro',
}

/**
 * Extrae el texto a procesar, priorizando caption (foto) sobre text.
 */
function extraerTexto(msg: TelegramMessage): string {
  return (msg.caption || msg.text || '').trim()
}

/**
 * Extrae los hashtags del texto (palabras que empiezan con #).
 */
function extraerHashtags(texto: string): string[] {
  const matches = texto.match(/#\w+/g)
  return matches
    ? matches.map((h) => h.replace('#', '')).filter((h) => h.length > 0)
    : []
}

/**
 * Extrae el primer link de descarga que coincida con dominios conocidos.
 */
function extraerLinkDescarga(texto: string): string {
  const patron =
    /https?:\/\/(?:www\.)?(?:terabox|bit\.ly|mega\.nz|drive\.google|mediafire|mega)[^\s)]+/i
  const match = texto.match(patron)
  return match ? match[0].replace(/[.)]+$/, '') : ''
}

/**
 * Deduce la categoría desde los hashtags.
 * Si no encuentra coincidencia, devuelve 'Comic' por defecto.
 */
function deducirCategoria(hashtags: string[]): string {
  for (const tag of hashtags) {
    const upper = tag.toUpperCase()
    if (upper in HASHTAG_CATEGORIA) {
      return HASHTAG_CATEGORIA[upper]
    }
  }
  return 'Comic'
}

/**
 * Obtiene la URL pública de una foto de Telegram.
 * Requiere TELEGRAM_BOT_TOKEN.
 */
async function obtenerUrlPortada(
  fileId: string
): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return ''

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
    )
    const json = await res.json()
    if (json.ok && json.result?.file_path) {
      return `https://api.telegram.org/file/bot${token}/${json.result.file_path}`
    }
  } catch {
    // Si falla la obtención, se deja url_portada vacía
  }
  return ''
}

/**
 * Parsea un mensaje de Telegram y extrae el contenido estructurado.
 *
 * @param msg - Mensaje de Telegram (channel_post o message)
 * @returns Objeto con los campos parseados para insertar en Supabase.
 */
async function parseTelegramContent(
  msg: TelegramMessage
): Promise<ParsedContent> {
  const texto = extraerTexto(msg)
  if (!texto) {
    throw new Error('El mensaje no contiene texto')
  }

  const lineas = texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // Título: primera línea no vacía que no sea hashtag ni link
  let titulo = ''
  for (const linea of lineas) {
    if (!linea.startsWith('#') && !linea.startsWith('http')) {
      titulo = linea
      break
    }
  }

  const hashtags = extraerHashtags(texto)
  const link_descarga = extraerLinkDescarga(texto)
  const categoria = deducirCategoria(hashtags)

  // Descripción: líneas que no son título, ni hashtags, ni link de descarga
  const descripcion = lineas
    .filter(
      (l) =>
        l !== titulo &&
        !l.startsWith('#') &&
        !l.includes(link_descarga.replace(/[.)]+$/, ''))
    )
    .join(' ')
    .trim()

  // Portada: si hay foto adjunta, obtener la URL
  let url_portada = ''
  if (msg.photo && msg.photo.length > 0) {
    // La última foto del array es la de mayor resolución
    const mejorFoto = msg.photo[msg.photo.length - 1]
    url_portada = await obtenerUrlPortada(mejorFoto.file_id)
  }

  return {
    titulo: titulo || 'Sin título',
    descripcion: descripcion || 'Sin descripción',
    url_portada,
    categoria: CATEGORIAS.includes(categoria as any) ? categoria : 'Comic',
    hashtags,
    link_descarga,
  }
}

/**
 * Valida que el token del bot sea correcto (opcional).
 */
function validarToken(request: Request): boolean {
  const authHeader = request.headers.get('x-telegram-bot-api-secret-token')
  const expected = process.env.TELEGRAM_SECRET_TOKEN
  if (expected) {
    return authHeader === expected
  }
  return true
}

/**
 * POST /api/telegram
 *
 * Webhook de Telegram. Recibe las actualizaciones del bot,
 * parsea el contenido del canal y lo inserta en Supabase.
 *
 * Configuración del webhook (ejecutar una vez):
 *   https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://todocomics-web.vercel.app/api/telegram
 *
 * Para verificar:
 *   https://api.telegram.org/bot<TU_TOKEN>/getWebhookInfo
 */
export async function POST(request: Request) {
  try {
    // Validación opcional de secret token
    if (!validarToken(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const update: TelegramUpdate = await request.json()

    // Obtener el mensaje (channel_post para canales, message para grupos/chats)
    const msg = update.channel_post || update.message

    if (!msg) {
      return NextResponse.json(
        { error: 'El payload no contiene channel_post ni message' },
        { status: 400 }
      )
    }

    const parsed = await parseTelegramContent(msg)

    if (!parsed.titulo || parsed.titulo === 'Sin título') {
      return NextResponse.json(
        { error: 'No se pudo extraer un título válido' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    const { data, error } = await admin
      .from('contenido')
      .insert({
        titulo: parsed.titulo,
        descripcion: parsed.descripcion,
        url_portada: parsed.url_portada,
        categoria: parsed.categoria,
        hashtags: parsed.hashtags,
        link_descarga: parsed.link_descarga,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error al insertar en Supabase:', error.message)
      return NextResponse.json(
        { error: 'Error al guardar el contenido' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ok: true, id: data.id, titulo: parsed.titulo },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error en webhook Telegram:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
