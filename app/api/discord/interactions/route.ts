import { NextResponse } from 'next/server'
import { verifyDiscordRequest } from '@/lib/discord-verify'
import {
  parseMessageLink,
  fetchDiscordMessage,
  sendFollowUp,
  extractTitle,
  extractDescription,
  extractImageUrl,
  extractDownloadLink,
  sanitizarTexto,
  PATRON_LINK,
} from '@/lib/discord-utils'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { CATEGORIAS } from '@/lib/hashtags'

interface DiscordInteraction {
  type: number
  token: string
  data?: {
    name: string
    options?: Array<{
      name: string
      value: string | number | boolean
    }>
  }
  member?: Record<string, unknown>
  guild_id?: string
}

export async function POST(request: Request) {
  try {
    const publicKey = process.env.DISCORD_PUBLIC_KEY

    if (!publicKey) {
      console.error('[Discord] Missing DISCORD_PUBLIC_KEY')
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    const signature = request.headers.get('x-signature-ed25519')
    const timestamp = request.headers.get('x-signature-timestamp')
    const rawBody = await request.text()

    if (!verifyDiscordRequest(rawBody, signature, timestamp, publicKey)) {
      return new NextResponse('Bad request signature', { status: 401 })
    }

    const interaction: DiscordInteraction = JSON.parse(rawBody)

    if (interaction.type === 1) {
      return NextResponse.json({ type: 1 })
    }

    if (interaction.type === 2 && interaction.data?.name === 'import') {
      const botToken = process.env.DISCORD_BOT_TOKEN
      if (!botToken) {
        console.error('[Discord] Missing DISCORD_BOT_TOKEN')
        return NextResponse.json({
          type: 4,
          data: {
            content: '❌ Error de configuración: DISCORD_BOT_TOKEN no está definido.',
            flags: 64,
          },
        })
      }

      const options = interaction.data.options || []
      const linkOpt = options.find((o) => o.name === 'link')
      const hashtagOpt = options.find((o) => o.name === 'hashtag')

      const messageUrl = typeof linkOpt?.value === 'string' ? linkOpt.value : ''
      const hashtag = typeof hashtagOpt?.value === 'string' ? hashtagOpt.value : ''

      if (!messageUrl || !hashtag) {
        return NextResponse.json({
          type: 4,
          data: {
            content: '❌ Faltan parámetros. Uso: `/import link: <url> hashtag: #Categoria`',
            flags: 64,
          },
        })
      }

      const response = NextResponse.json({ type: 5 })

      processImport(messageUrl, hashtag, interaction.token, botToken).catch((err) => {
        console.error('[Discord] processImport error:', err)
        sendFollowUp(interaction.token, `❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`, botToken)
      })

      return response
    }

    return NextResponse.json({ type: 1 })
  } catch (err) {
    console.error('[Discord] Error en handler:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function processImport(
  messageUrl: string,
  hashtag: string,
  interactionToken: string,
  botToken: string
) {
  const parsed = parseMessageLink(messageUrl)
  if (!parsed) {
    await sendFollowUp(interactionToken, '❌ URL inválida. Debe ser: https://discord.com/channels/guild/channel/message', botToken)
    return
  }

  await sendFollowUp(interactionToken, '🔍 Obteniendo mensaje de Discord...', botToken)

  const msg = await fetchDiscordMessage(parsed.channelId, parsed.messageId, botToken)
  if (!msg) {
    await sendFollowUp(interactionToken, '❌ No se pudo obtener el mensaje. Verifica que el bot tenga acceso al canal.', botToken)
    return
  }

  const titulo = extractTitle(msg)
  if (!titulo) {
    await sendFollowUp(interactionToken, '❌ El mensaje no contiene un embed con título.', botToken)
    return
  }

  await sendFollowUp(interactionToken, `📝 Procesando: **${titulo}**...`, botToken)

  const descripcionRaw = extractDescription(msg)
  const link_descarga = extractDownloadLink(msg) || ''
  const imageUrl = extractImageUrl(msg)

  let url_portada = ''

  if (imageUrl) {
    await sendFollowUp(interactionToken, '🖼️ Descargando portada...', botToken)

    try {
      const imageRes = await fetch(imageUrl)
      if (imageRes.ok) {
        const imageBuffer = await imageRes.arrayBuffer()
        const { uploadImageBytesToSupabase } = await import('@/lib/upload-image')
        const filename = `portada-${Date.now()}.jpg`
        url_portada = await uploadImageBytesToSupabase(imageBuffer, filename)
      }
    } catch (err) {
      console.error('[Discord] Error descargando portada:', err)
    }
  }

  const categoria = CATEGORIAS.includes(hashtag as typeof CATEGORIAS[number])
    ? hashtag
    : 'Comic'

  const discordMessageId = parsed.messageId

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('contenido')
    .select('id')
    .eq('discord_message_id', discordMessageId)
    .maybeSingle()

  if (existing) {
    await sendFollowUp(interactionToken, `⚠️ Este mensaje ya fue importado (ID: ${existing.id})`, botToken)
    return
  }

  const descripcionFinal = sanitizarTexto(descripcionRaw || 'Sin descripción')

  const { data: nuevo, error } = await admin
    .from('contenido')
    .insert({
      titulo: sanitizarTexto(titulo),
      descripcion: descripcionFinal,
      url_portada,
      categoria,
      hashtags: [categoria],
      link_descarga: sanitizarTexto(link_descarga),
      discord_message_id: discordMessageId,
    })
    .select('id')
    .single()

  if (error) {
    await sendFollowUp(interactionToken, `❌ Error al guardar: ${error.message}`, botToken)
    return
  }

  let resumen = `✅ **Importado correctamente**\n📌 **${titulo}** como #${categoria}\n🆔 ID: ${nuevo.id}`

  if (url_portada) resumen += `\n🖼️ Portada subida`
  if (link_descarga) resumen += `\n🔗 Link de descarga detectado`
  if (!descripcionRaw) resumen += `\n⚠️ Sin descripción`

  await sendFollowUp(interactionToken, resumen, botToken)
}
