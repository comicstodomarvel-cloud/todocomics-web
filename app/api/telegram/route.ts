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

const CATEGORIAS = ['Comic', 'Manga', 'Pelicula', 'Serie', 'Libro'] as const

const HASHTAG_CATEGORIA: Record<string, (typeof CATEGORIAS)[number]> = {
  COMIC: 'Comic',
  MANGA: 'Manga',
  PELICULA: 'Pelicula',
  SERIE: 'Serie',
  LIBRO: 'Libro',
}

const PREFIJOS_DESCARGA = /^(descarga\s*(directa|gratis)|link|enlace|mega|mediafire)[:\s]*$/i

const PATRON_LINK =
  /https?:\/\/(?:www\.)?(?:terabox|bit\.ly|mega\.nz|drive\.google|mediafire|mega)[^\s)]+/i

/**
 * Extrae el texto del mensaje.
 * Si hay foto adjunta, Telegram pone el texto en `caption`.
 */
function extraerTexto(msg: TelegramMessage): string {
  return (msg.caption || msg.text || '').trim()
}

/**
 * Extrae todos los hashtags del texto completo.
 */
function extraerHashtags(texto: string): string[] {
  const matches = texto.match(/#\w+/g)
  return matches
    ? [...new Set(matches.map((h) => h.replace('#', '')).filter(Boolean))]
    : []
}

/**
 * Busca el primer link de descarga en el texto.
 */
function extraerLinkDescarga(texto: string): string {
  const match = texto.match(PATRON_LINK)
  return match ? match[0].replace(/[.,;:)\]}>]+$/, '') : ''
}

/**
 * Deduce la categoría desde los hashtags.
 */
function deducirCategoria(hashtags: string[]): string {
  for (const tag of hashtags) {
    const upper = tag.toUpperCase()
    if (upper in HASHTAG_CATEGORIA) return HASHTAG_CATEGORIA[upper]
  }
  return 'Comic'
}

/**
 * Obtiene la URL pública de una foto de Telegram.
 * Telegram no envía URLs directas; hay que resolver el file_path.
 */
async function obtenerUrlPortada(fileId: string): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.warn('[Telegram Webhook] TELEGRAM_BOT_TOKEN no definido')
    return ''
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
    )
    if (!res.ok) {
      console.error('[Telegram Webhook] getFile status:', res.status)
      return ''
    }

    const json = await res.json()
    if (!json.ok) {
      console.error('[Telegram Webhook] getFile error:', json.description)
      return ''
    }

    const filePath: string | undefined = json.result?.file_path
    if (!filePath) {
      console.error('[Telegram Webhook] getFile no devolvió file_path')
      return ''
    }

    const url = `https://api.telegram.org/file/bot${token}/${filePath}`
    console.log('[Telegram Webhook] Portada resuelta:', url)
    return url
  } catch (err) {
    console.error('[Telegram Webhook] Error al obtener portada:', err)
    return ''
  }
}

/**
 * Remueve hashtags del final de una línea de título.
 * Ej: "BLADE AND BASTARD #Manga" → "BLADE AND BASTARD"
 */
function limpiarTitulo(linea: string): string {
  return linea.replace(/\s+#\w+(?:\s+#\w+)*\s*$/, '').trim()
}

/**
 * Indica si una línea es considerada "ruido" y debe omitirse de la descripción.
 */
function esLineaRuido(linea: string, linkDescarga: string): boolean {
  if (!linea) return true
  if (linea.startsWith('#')) return true
  if (PREFIJOS_DESCARGA.test(linea)) return true
  if (linkDescarga && linea.includes(linkDescarga.replace(/[.,;:)\]}>]+$/, ''))) return true
  return false
}

/**
 * Parsea el mensaje de Telegram y extrae el contenido estructurado.
 *
 * Formato esperado del post:
 *   [IMAGEN ADJUNTA]
 *   TÍTULO DEL CONTENIDO #Hashtag
 *
 *   Descripción con múltiples
 *   párrafos separados por saltos de línea...
 *
 *   DESCARGA DIRECTA
 *   https://terabox.com/s/...
 */
async function parseTelegramContent(
  msg: TelegramMessage
): Promise<ParsedContent> {
  const texto = extraerTexto(msg)
  console.log('[Telegram Webhook] Texto recibido:', texto.slice(0, 500))

  if (!texto) {
    throw new Error('El mensaje no contiene texto')
  }

  const lineas = texto.split('\n').map((l) => l.trim())

  // --- Título ---
  const tituloCrudo = lineas.find((l) => l.length > 0 && !l.startsWith('http')) || ''
  const titulo = limpiarTitulo(tituloCrudo)

  // --- Hashtags (de todo el texto) ---
  const hashtags = extraerHashtags(texto)
  const categoria = deducirCategoria(hashtags)

  // --- Link de descarga ---
  const link_descarga = extraerLinkDescarga(texto)

  // --- Descripción (líneas que no son título, hashtags, links ni ruido) ---
  const lineasDesc = lineas.filter((l) => {
    if (!l) return false
    if (l === tituloCrudo || l === titulo) return false
    if (esLineaRuido(l, link_descarga)) return false
    if (PATRON_LINK.test(l)) return false
    return true
  })

  const descripcion = lineasDesc.join('\n').trim() || 'Sin descripción'

  // --- Portada ---
  let url_portada = ''
  if (msg.photo && msg.photo.length > 0) {
    const mejorFoto = msg.photo[msg.photo.length - 1]
    console.log('[Telegram Webhook] Foto encontrada, file_id:', mejorFoto.file_id)
    url_portada = await obtenerUrlPortada(mejorFoto.file_id)
  } else {
    console.log('[Telegram Webhook] No hay foto adjunta en el mensaje')
  }

  const parsed: ParsedContent = {
    titulo,
    descripcion,
    url_portada,
    categoria,
    hashtags,
    link_descarga,
  }

  console.log('[Telegram Webhook] Parseo completado:', JSON.stringify(parsed, null, 2))
  return parsed
}

function validarToken(request: Request): boolean {
  const authHeader = request.headers.get('x-telegram-bot-api-secret-token')
  const expected = process.env.TELEGRAM_SECRET_TOKEN
  if (expected) return authHeader === expected
  return true
}

/**
 * POST /api/telegram
 *
 * Webhook de Telegram. Recibe updates del bot, parsea el contenido
 * del canal y lo inserta en Supabase.
 *
 * Configurar webhook (una sola vez):
 *   https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://todocomics-web.vercel.app/api/telegram
 *
 * Verificar:
 *   https://api.telegram.org/bot<TU_TOKEN>/getWebhookInfo
 */
export async function POST(request: Request) {
  try {
    if (!validarToken(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const update: TelegramUpdate = await request.json()
    console.log('[Telegram Webhook] Payload recibido:', JSON.stringify(update, null, 2))

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
      console.error('[Telegram Webhook] Error al insertar en Supabase:', error.message)
      return NextResponse.json(
        { error: 'Error al guardar el contenido' },
        { status: 500 }
      )
    }

    console.log('[Telegram Webhook] Contenido insertado correctamente, id:', data.id)
    return NextResponse.json(
      { ok: true, id: data.id, titulo: parsed.titulo },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[Telegram Webhook] Error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
