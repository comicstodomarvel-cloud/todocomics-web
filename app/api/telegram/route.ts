import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface TelegramUpdate {
  update_id: number
  channel_post?: TelegramMessage
  edited_channel_post?: TelegramMessage
  message?: TelegramMessage
  edited_message?: TelegramMessage
}

interface TelegramPhoto {
  file_id: string
  file_unique_id: string
  file_size?: number
  width?: number
  height?: number
}

interface TelegramDocument {
  file_id: string
  file_unique_id: string
  file_name?: string
  mime_type?: string
  file_size?: number
}

interface TelegramMessage {
  message_id: number
  chat: { id: number; type: string }
  text?: string
  caption?: string
  photo?: TelegramPhoto[]
  document?: TelegramDocument
  date: number
  edit_date?: number
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
  /https?:\/\/(?:www\.)?(?:[0-9]+terabox|terabox|teraboxapp|teraboxurl|freeterabox|videy|videyyy|freevidey|videynow|bit\.ly|bitly|mega\.nz|mega|drive\.google|mediafire|short\.url|tinyurl|ow\.ly|is\.gd)[^\s)"'\]]+/i

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
 * Busca un file_id de imagen en el mensaje, primero en photo y luego en document.
 * - photo: array de tamaños, usar el último (mayor resolución)
 * - document: solo si mime_type empieza con image/
 *
 * @returns file_id de la imagen, o null si no hay ninguna.
 */
function obtenerFileId(msg: TelegramMessage): string | null {
  console.log('[obtenerFileId] === INICIO ===')
  console.log('[obtenerFileId] msg.photo existe:', !!msg.photo)
  console.log('[obtenerFileId] msg.document existe:', !!msg.document)

  if (msg.photo) {
    console.log('[obtenerFileId] msg.photo.length:', msg.photo.length)
    console.log('[obtenerFileId] Última foto (mayor):', JSON.stringify(msg.photo[msg.photo.length - 1]))
  }

  if (msg.photo && msg.photo.length > 0) {
    const fileId = msg.photo[msg.photo.length - 1].file_id
    console.log('[obtenerFileId] file_id extraído de photo:', fileId)
    return fileId
  }

  if (msg.document) {
    console.log('[obtenerFileId] document.mime_type:', msg.document.mime_type)
    console.log('[obtenerFileId] document.file_id:', msg.document.file_id)
    if (msg.document.mime_type?.startsWith('image/')) {
      console.log('[obtenerFileId] Es imagen, usando document.file_id')
      return msg.document.file_id
    }
    console.log('[obtenerFileId] No es imagen, ignorando document')
    return null
  }

  console.log('[obtenerFileId] No se encontró file_id')
  return null
}

/**
 * Obtiene la URL pública de una foto de Telegram.
 * Telegram no envía URLs directas; hay que resolver el file_path.
 */
async function obtenerUrlPortada(fileId: string): Promise<string> {
  console.log('[obtenerUrlPortada] === INICIO ===')
  console.log('[obtenerUrlPortada] fileId recibido:', fileId)

  const token = process.env.TELEGRAM_BOT_TOKEN
  console.log('[obtenerUrlPortada] TELEGRAM_BOT_TOKEN existe:', !!token)
  console.log('[obtenerUrlPortada] token length:', token?.length)

  if (!token) {
    console.error('[obtenerUrlPortada] ERROR: TELEGRAM_BOT_TOKEN no definido')
    return ''
  }

  const url = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
  console.log('[obtenerUrlPortada] URL de getFile:', url)

  try {
    console.log('[obtenerUrlPortada] Llamando a fetch...')
    const res = await fetch(url)
    console.log('[obtenerUrlPortada] Response status:', res.status)
    console.log('[obtenerUrlPortada] Response ok:', res.ok)

    if (!res.ok) {
      console.error('[obtenerUrlPortada] ERROR: HTTP status', res.status)
      const errorText = await res.text()
      console.error('[obtenerUrlPortada] Error body:', errorText)
      return ''
    }

    const json = await res.json()
    console.log('[obtenerUrlPortada] Respuesta completa de getFile:')
    console.log(JSON.stringify(json, null, 2))

    if (!json.ok) {
      console.error('[obtenerUrlPortada] ERROR: json.ok = false')
      console.error('[obtenerUrlPortada] description:', json.description)
      return ''
    }

    const filePath = json.result?.file_path
    console.log('[obtenerUrlPortada] file_path:', filePath)

    if (!filePath) {
      console.error('[obtenerUrlPortada] ERROR: file_path es undefined')
      return ''
    }

    const finalUrl = `https://api.telegram.org/file/bot${token}/${filePath}`
    console.log('[obtenerUrlPortada] URL final construida:', finalUrl)

    return finalUrl
  } catch (err) {
    console.error('[obtenerUrlPortada] ERROR en try/catch:', err)
    if (err instanceof Error) {
      console.error('[obtenerUrlPortada] Error stack:', err.stack)
    }
    return ''
  }
}

/**
 * Sube una imagen desde una URL temporal de Telegram a Supabase Storage.
 * Supabase Storage provee URLs permanentes que nunca expiran.
 *
 * @param telegramFileUrl - URL temporal de Telegram (api.telegram.org/file/...)
 * @param filename - Nombre base para el archivo (ej: "portada-1234567890.jpg")
 * @returns URL pública permanente en Supabase Storage, o cadena vacía si falla.
 */
async function uploadImageToSupabase(
  telegramFileUrl: string,
  filename: string
): Promise<string> {
  const supabase = getSupabaseAdmin()
  const MAX_INTENTOS = 3

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      console.log(`[uploadImageToSupabase] Intento ${intento}/${MAX_INTENTOS}`)

      // 1. Descargar la imagen de Telegram
      console.log('[uploadImageToSupabase] Descargando desde:', telegramFileUrl)
      const imageRes = await fetch(telegramFileUrl)
      if (!imageRes.ok) {
        console.error('[uploadImageToSupabase] Error descargando:', imageRes.status)
        if (intento < MAX_INTENTOS) continue
        return ''
      }

      const imageBuffer = await imageRes.arrayBuffer()
      console.log('[uploadImageToSupabase] Imagen descargada, tamaño:', imageBuffer.byteLength)

      // 2. Subir a Supabase Storage
      const filePath = `${Date.now()}-${filename}`
      const { data, error } = await supabase.storage
        .from('portadas')
        .upload(filePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (error) {
        console.error('[uploadImageToSupabase] Error de Supabase:', error.message)
        if (intento < MAX_INTENTOS) {
          console.log('[uploadImageToSupabase] Reintentando en 1s...')
          await new Promise((r) => setTimeout(r, 1000))
          continue
        }
        return ''
      }

      // 3. Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('portadas').getPublicUrl(data.path)

      console.log('[uploadImageToSupabase] Subida exitosa, URL permanente:', publicUrl)
      return publicUrl
    } catch (err) {
      console.error(`[uploadImageToSupabase] Error en intento ${intento}:`, err)
      if (intento < MAX_INTENTOS) {
        console.log('[uploadImageToSupabase] Reintentando en 1s...')
        await new Promise((r) => setTimeout(r, 1000))
        continue
      }
    }
  }

  return ''
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

  // --- Portada (subida automática a Supabase Storage para URLs permanentes) ---
  console.log('[parseTelegramContent] === INICIO ===')
  console.log('[parseTelegramContent] msg.photo?.length:', msg.photo?.length)

  const fileId = obtenerFileId(msg)
  console.log('[parseTelegramContent] fileId retornado:', fileId)

  let url_portada = ''
  if (fileId) {
    const telegramFileUrl = await obtenerUrlPortada(fileId)
    console.log('[parseTelegramContent] URL temporal de Telegram:', telegramFileUrl)

    if (telegramFileUrl) {
      console.log('[parseTelegramContent] Subiendo a Supabase Storage...')
      const filename = `portada-${Date.now()}.jpg`
      url_portada = await uploadImageToSupabase(telegramFileUrl, filename)
      console.log('[parseTelegramContent] URL permanente en Supabase:', url_portada)
    }
  } else {
    console.log('[parseTelegramContent] No hay fileId, url_portada vacía')
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
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET

  console.log('[Webhook Security] === VALIDANDO TOKEN ===')
  console.log('[Webhook Security] Header recibido:', authHeader ? '***' + authHeader.slice(-10) : 'NO DEFINIDO')
  console.log('[Webhook Security] Variable de entorno:', expected ? '***' + expected.slice(-10) : 'NO DEFINIDA')
  console.log('[Webhook Security] Coinciden:', authHeader === expected)

  if (!expected) {
    console.error('[Webhook Security] ERROR: TELEGRAM_WEBHOOK_SECRET no está definida')
    return false
  }

  if (!authHeader) {
    console.error('[Webhook Security] ERROR: Telegram no envió el secret_token')
    return false
  }

  if (authHeader !== expected) {
    console.error('[Webhook Security] ERROR: Los tokens no coinciden')
    return false
  }

  console.log('[Webhook Security] ✅ Token válido')
  return true
}

function sanitizarTexto(texto: string): string {
  return texto
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim()
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
    console.log('[Telegram Webhook] === NUEVO UPDATE ===')
    console.log('[Telegram Webhook] Keys del update:', Object.keys(update))

    const msg = update.channel_post || update.edited_channel_post || update.message || update.edited_message

    let messageType = 'ninguno'
    if (update.channel_post) messageType = 'channel_post'
    if (update.edited_channel_post) messageType = 'edited_channel_post'
    if (update.message) messageType = 'message'
    if (update.edited_message) messageType = 'edited_message'

    console.log('[Telegram Webhook] Tipo de mensaje:', messageType)

    if (msg?.edit_date) {
      console.log('[Telegram Webhook] Mensaje editado (edit_date):', msg.edit_date)
    }
    console.log('[Telegram Webhook] Keys del msg:', msg ? Object.keys(msg) : 'no msg')
    console.log('[Telegram Webhook] msg.photo existe:', !!msg?.photo, '| length:', msg?.photo?.length ?? 0)
    console.log('[Telegram Webhook] msg.document existe:', !!msg?.document, '| mime_type:', msg?.document?.mime_type ?? 'N/A')
    console.log('[Telegram Webhook] Payload completo:', JSON.stringify(update, null, 2))

    if (!msg) {
      return NextResponse.json(
        { error: 'El payload no contiene channel_post, edited_channel_post ni message' },
        { status: 400 }
      )
    }

    if (msg.chat.id !== -1001406494973) {
      return NextResponse.json(
        { error: 'Canal no autorizado' },
        { status: 403 }
      )
    }

    const parsed = await parseTelegramContent(msg)

    if (!parsed.titulo || parsed.titulo === 'Sin título') {
      return NextResponse.json(
        { error: 'No se pudo extraer un título válido' },
        { status: 400 }
      )
    }

    const isEdit = !!update.edited_channel_post || !!update.edited_message
    const messageId = msg.message_id

    console.log('[Telegram Webhook] Es edición:', isEdit)
    console.log('[Telegram Webhook] Message ID:', messageId)

    const admin = getSupabaseAdmin()

    const { data: existing, error: searchError } = await admin
      .from('contenido')
      .select('id, url_portada')
      .eq('telegram_message_id', messageId)
      .maybeSingle()

    if (existing) {
      console.log('[Telegram Webhook] Post ya existe (ID:', existing.id, '). Actualizando...')

      const portadaFinal = parsed.url_portada || existing.url_portada

      if (parsed.url_portada) {
        console.log('[Telegram Webhook] Portada actualizada con la nueva imagen')
      } else {
        console.log('[Telegram Webhook] Manteniendo portada anterior')
      }

      const { error: updateError } = await admin
        .from('contenido')
        .update({
          titulo: sanitizarTexto(parsed.titulo),
          descripcion: sanitizarTexto(parsed.descripcion),
          url_portada: portadaFinal,
          categoria: parsed.categoria,
          hashtags: parsed.hashtags,
          link_descarga: sanitizarTexto(parsed.link_descarga),
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('[Telegram Webhook] Error al actualizar:', updateError.message)
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
      }

      console.log('[Telegram Webhook] ✅ Post actualizado correctamente, id:', existing.id)
      return NextResponse.json({
        ok: true,
        action: 'updated',
        id: existing.id,
        titulo: sanitizarTexto(parsed.titulo),
      }, { status: 200 })
    }

    console.log('[Telegram Webhook] Post nuevo. Insertando...')

    const { data, error } = await admin
      .from('contenido')
      .insert({
        titulo: sanitizarTexto(parsed.titulo),
        descripcion: sanitizarTexto(parsed.descripcion),
        url_portada: parsed.url_portada,
        categoria: parsed.categoria,
        hashtags: parsed.hashtags,
        link_descarga: sanitizarTexto(parsed.link_descarga),
        telegram_message_id: messageId,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[Telegram Webhook] Error al insertar:', error.message)
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    console.log('[Telegram Webhook] ✅ Post insertado, id:', data.id)
    return NextResponse.json({
      ok: true,
      action: 'inserted',
      id: data.id,
      titulo: sanitizarTexto(parsed.titulo),
    }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[Telegram Webhook] Error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
