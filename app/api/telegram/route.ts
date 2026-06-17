import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { CATEGORIAS, HASHTAG_CATEGORIA } from '@/lib/hashtags'

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

interface TelegramEntity {
  offset: number
  length: number
  type: string
  url?: string
}

interface TelegramMessage {
  message_id: number
  chat: { id: number; type: string; username?: string; title?: string }
  text?: string
  caption?: string
  photo?: TelegramPhoto[]
  document?: TelegramDocument
  caption_entities?: TelegramEntity[]
  entities?: TelegramEntity[]
  date: number
  edit_date?: number
  from?: { id: number; is_bot: boolean; username?: string; first_name?: string }
}

interface ParsedContent {
  titulo: string
  descripcion: string
  url_portada: string
  categoria: string
  hashtags: string[]
  link_descarga: string
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
 * Extrae URLs de las entidades del mensaje (hyperlinks de Telegram).
 * Busca en caption_entities y entities.
 */
function extraerHyperlinks(msg: TelegramMessage): string[] {
  const urls: string[] = []

  const entities = msg.caption_entities || msg.entities || []

  for (const entity of entities) {
    if (entity.type === 'text_link' && entity.url) {
      console.log('[Hyperlink] Encontrado:', entity.url)
      urls.push(entity.url)
    }
  }

  return urls
}

/**
 * Extrae el link de descarga priorizando hyperlinks sobre texto plano.
 */
function extraerLinkDescargaMejorado(msg: TelegramMessage, texto: string): string {
  // 1. Primero buscar hyperlinks en entidades
  const hyperlinks = extraerHyperlinks(msg)

  const downloadLinks = hyperlinks.filter((url) => PATRON_LINK.test(url))

  if (downloadLinks.length > 0) {
    console.log('[Link] Hyperlink encontrado:', downloadLinks[0])
    return downloadLinks[0]
  }

  // 2. Fallback a texto plano
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
export async function parseTelegramContent(
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

  // --- Link de descarga (prioriza hyperlinks, fallback a texto plano) ---
  const link_descarga = extraerLinkDescargaMejorado(msg, texto)

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

function limpiarDescripcionUpdate(descripcion: string): string {
  return descripcion
    .replace(/LINK DIRECTO AL POST\s*\(?\s*https?:\/\/[^\s)]+\s*\)?/gi, '')
    .replace(/LINK DIRECTO\s*AL\s*POST/gi, '')
    .replace(/https?:\/\/t\.me\/[^\s)]+/gi, '')
    .trim()
}

function extraerLinkPostOriginal(texto: string): string | null {
  const match = texto.match(/LINK DIRECTO AL POST \((https:\/\/t\.me\/[^)]+)\)/i)
  if (match) return match[1]

  // Fallback: cualquier link a t.me en el texto
  const fallback = texto.match(/https:\/\/t\.me\/[^\s)]+/i)
  return fallback ? fallback[0].replace(/[.,;:)\]}>]+$/, '') : null
}

function extraerMessageIdFromTelegramUrl(url: string): number | null {
  const match = url.match(/\/(\d+)$/)
  return match ? parseInt(match[1]) : null
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

export function sanitizarTexto(texto: string): string {
  return texto
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim()
}

async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
  } catch (e) {
    console.error('[sendMessage] Error:', e)
  }
}

async function sendHelpMessage(chatId: number) {
  await sendMessage(chatId, `📖 Comandos disponibles:

/importar <url> - Importar un post antiguo de Telegram
  Ejemplo: /importar https://t.me/marveltodocomics/11327

/importar_lote [N|--todo|--check] - Importar lotes desde historial
  /importar_lote         → últimos 50 posts
  /importar_lote 100     → últimos 100
  /importar_lote --todo  → todo el historial
  /importar_lote --check → dry run (simular sin guardar)

/help - Mostrar esta ayuda`)
}

async function handlePrivateMessage(msg: TelegramMessage) {
  const texto = (msg.text || msg.caption || '').trim()
  const chatId = msg.chat.id

  if (texto === '/start' || texto === '/help' || texto === '/ayuda') {
    await sendHelpMessage(chatId)
    return NextResponse.json({ ok: true })
  }

  if (texto.startsWith('/importar_lote')) {
    return await handleImportLoteCommand(msg, texto, chatId)
  }

  if (texto.startsWith('/importar')) {
    return await handleImportCommandPrivate(msg, texto, chatId)
  }

  await sendMessage(chatId, `Comando no reconocido. Usa /help para ver los comandos disponibles.`)
  return NextResponse.json({ ok: true })
}

async function handleImportLoteCommand(msg: TelegramMessage, command: string, chatId: number) {
  const updateMsg = async (text: string) => sendMessage(chatId, text)

  try {
    const parts = command.split(/\s+/)
    const flag = parts[1]
    let limit = 50
    let dryRun = false

    if (flag === '--check' || flag === '--dry-run') {
      dryRun = true
      limit = parts[2] ? parseInt(parts[2]) : 50
    } else if (flag === '--todo') {
      limit = -1
    } else if (flag && !isNaN(parseInt(flag))) {
      limit = parseInt(flag)
    }

    await updateMsg(`🔍 Escaneando historial del canal (límite: ${limit === -1 ? 'todos' : limit})...`)

    const { scanChannelHistory } = await import('@/lib/channel-scanner')
    const scanResult = await scanChannelHistory(limit)

    if (scanResult.totalFetched === 0) {
      await updateMsg('❌ No se encontraron mensajes en el canal.')
      return NextResponse.json({ ok: true })
    }

    await updateMsg(`📦 Procesando ${scanResult.totalFetched} mensajes...`)

    const { batchImport } = await import('@/lib/batch-importer')
    const result = await batchImport(scanResult.messages, dryRun)

    const resumen = [
      dryRun ? '🔍 **DRY RUN - Sin cambios**' : '✅ **Importación completada**',
      '',
      `📥 Total mensajes escaneados: ${scanResult.totalFetched}`,
      `✅ Importados: ${result.imported}`,
      `⏭️  Saltados (#update): ${result.skipped.update}`,
      `⏭️  Saltados (sin categoría): ${result.skipped.sinCategoria}`,
      `⏭️  Saltados (duplicados): ${result.skipped.duplicado}`,
      `🔗 Updates vinculados: ${result.updatesVinculados}`,
      result.errores > 0 ? `❌ Errores: ${result.errores}` : '',
    ].filter(Boolean).join('\n')

    await updateMsg(resumen)

    if (result.detalles.length > 0) {
      const detallesStr = result.detalles.slice(0, 20).join('\n')
      await updateMsg(`📋 Detalles:\n${detallesStr}${result.detalles.length > 20 ? `\n... y ${result.detalles.length - 20} más` : ''}`)
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[handleImportLoteCommand] Error:', error)
    await updateMsg(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    return NextResponse.json({ ok: true })
  }
}

async function handleImportCommandPrivate(msg: TelegramMessage, command: string, chatId: number) {
  const updateMsg = async (text: string) => sendMessage(chatId, text)

  try {
    await updateMsg('🔄 Iniciando importación...')

    const parts = command.split(/\s+/)
    const url = parts[1]

    if (!url) {
      await updateMsg('❌ Uso: /importar https://t.me/marveltodocomics/12345')
      return NextResponse.json({ ok: true })
    }

    const match = url.match(/\/(\d+)$/)
    if (!match) {
      await updateMsg('❌ URL inválida. Debe ser: https://t.me/marveltodocomics/12345')
      return NextResponse.json({ ok: true })
    }

    const messageId = parseInt(match[1])
    await updateMsg(`🔍 Obteniendo mensaje ${messageId}...`)

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatOrigen = '-1001406494973'

    const forwardRes = await fetch(`https://api.telegram.org/bot${token}/forwardMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, from_chat_id: chatOrigen, message_id: messageId }),
    })

    const forwardData = await forwardRes.json()

    if (!forwardData.ok) {
      await updateMsg(`❌ No se pudo obtener el mensaje: ${forwardData.description}`)
      return NextResponse.json({ ok: true })
    }

    const forwardedMsg = forwardData.result
    await updateMsg('📝 Parseando contenido...')

    const parsed = await parseTelegramContent(forwardedMsg)

    const admin = getSupabaseAdmin()

    const { data: existing } = await admin
      .from('contenido')
      .select('id')
      .eq('telegram_message_id', messageId)
      .maybeSingle()

    if (existing) {
      await updateMsg(`⚠️ Este post ya existe en la web (ID: ${existing.id})`)
      return NextResponse.json({ ok: true })
    }

    const { data: nuevoContenido, error: insertError } = await admin
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

    if (insertError) {
      await updateMsg(`❌ Error al guardar: ${insertError.message}`)
      return NextResponse.json({ ok: true })
    }

    await updateMsg(`✅ Post importado correctamente (ID: ${nuevoContenido.id})`)

    let updatesVinculados = 0

    try {
      // 1. Buscar orphans por link_post_original (con / antes del ID para precisión)
      const { data: orphansPorLink } = await admin
        .from('actualizaciones')
        .select('id')
        .eq('contenido_id', null)
        .filter('metadata->>link_post_original', 'like', `%/${messageId}`)

      // 2. También buscar por telegram_message_id_original (más robusto)
      const { data: orphansPorId } = await admin
        .from('actualizaciones')
        .select('id')
        .eq('contenido_id', null)
        .eq('metadata->>telegram_message_id_original', messageId.toString())

      const idsToLink = new Set<string>()

      for (const o of orphansPorLink || []) idsToLink.add(o.id)
      for (const o of orphansPorId || []) idsToLink.add(o.id)

      if (idsToLink.size > 0) {
        const { error: linkError } = await admin
          .from('actualizaciones')
          .update({
            contenido_id: nuevoContenido.id,
            metadata: {
              es_huerfano: false,
              vinculado_en: new Date().toISOString(),
            },
          })
          .in('id', [...idsToLink])

        if (!linkError) {
          updatesVinculados = idsToLink.size
          await updateMsg(`🔗 ${updatesVinculados} actualización(es) huérfana(s) vinculada(s)`)
        } else {
          console.error('[handleImportCommandPrivate] Error al vincular:', linkError)
        }
      }
    } catch (err) {
      console.error('[handleImportCommandPrivate] Error vinculando updates:', err)
    }

    return NextResponse.json({ ok: true, id: nuevoContenido.id, updatesVinculados })
  } catch (error) {
    console.error('[handleImportCommandPrivate] Error:', error)
    await updateMsg(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    return NextResponse.json({ ok: true })
  }
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
    const update: TelegramUpdate = await request.json()
    console.log('[Telegram Webhook] === NUEVO UPDATE ===')
    console.log('[Telegram Webhook] Keys del update:', Object.keys(update))

    const msg = update.channel_post || update.edited_channel_post || update.message || update.edited_message

    if (!msg) {
      return NextResponse.json(
        { error: 'El payload no contiene channel_post ni message' },
        { status: 400 }
      )
    }

    // Mensaje privado → procesar comandos sin validar token
    if (msg.chat.type === 'private') {
      console.log('[Webhook] Mensaje privado detectado, chat:', msg.chat.id)
      return await handlePrivateMessage(msg)
    }

    // Channel post → validar token
    if (!validarToken(request)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

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

    const esUpdate = parsed.hashtags.some((h) => h.toLowerCase() === 'update')

    if (esUpdate) {
      console.log('[Webhook] === POST DE UPDATE DETECTADO ===')
      console.log('[Webhook] Título:', parsed.titulo)

      const textoCompleto = extraerTexto(msg)
      const linkOriginal = extraerLinkPostOriginal(textoCompleto)
      const messageIdOriginal = linkOriginal ? extraerMessageIdFromTelegramUrl(linkOriginal) : null

      console.log('[Webhook] Link original:', linkOriginal)
      console.log('[Webhook] Message ID original:', messageIdOriginal)

      if (messageIdOriginal) {
        const admin = getSupabaseAdmin()
        const { data: contenidoOriginal } = await admin
          .from('contenido')
          .select('id')
          .eq('telegram_message_id', messageIdOriginal)
          .maybeSingle()

        if (contenidoOriginal) {
          console.log('[Webhook] Contenido original encontrado:', contenidoOriginal.id)

          const { error: insertError } = await admin
            .from('actualizaciones')
            .insert({
              contenido_id: contenidoOriginal.id,
              titulo: parsed.titulo.replace(/POST ACTUALIZADO \| /i, '').trim(),
              descripcion: limpiarDescripcionUpdate(sanitizarTexto(parsed.descripcion)),
              tipo: 'volumen',
              fecha: new Date().toISOString(),
              telegram_message_id: msg.message_id,
              metadata: {
                link_post_original: linkOriginal,
                telegram_message_id_original: messageIdOriginal,
                portada_url: parsed.url_portada,
              },
            })

          if (insertError) {
            console.error('[Webhook] Error al crear update:', insertError)
            return NextResponse.json({ error: 'Error al guardar update' }, { status: 500 })
          }

          console.log('[Webhook] Update registrado correctamente')
          return NextResponse.json({
            ok: true,
            action: 'update_registered',
            contenido_id: contenidoOriginal.id,
          }, { status: 200 })
        }

        console.log('[Webhook] Update huérfano - contenido original no encontrado, registrando sin vínculo')
      } else {
        console.log('[Webhook] Update huérfano - no se pudo extraer message_id del link, registrando sin vínculo')
      }

      const admin = getSupabaseAdmin()
      const { error: orphanError } = await admin
        .from('actualizaciones')
        .insert({
          contenido_id: null,
          titulo: parsed.titulo.replace(/POST ACTUALIZADO \| /i, '').trim(),
          descripcion: limpiarDescripcionUpdate(sanitizarTexto(parsed.descripcion)),
          tipo: 'volumen',
          fecha: new Date().toISOString(),
          telegram_message_id: msg.message_id,
          metadata: {
            link_post_original: linkOriginal,
            telegram_message_id_original: messageIdOriginal,
            portada_url: parsed.url_portada,
            es_huerfano: true,
          },
        })

      if (orphanError) {
        console.error('[Webhook] Error al crear update huérfano:', orphanError)
        return NextResponse.json({ error: 'Error al guardar update huérfano' }, { status: 500 })
      }

      console.log('[Webhook] Update huérfano registrado correctamente')
      return NextResponse.json({
        ok: true,
        action: 'orphan_update_registered',
      }, { status: 200 })
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
