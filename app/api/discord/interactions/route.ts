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
} from '@/lib/discord-utils'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { HASHTAG_CATEGORIA } from '@/lib/hashtags'

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

function deducirCategoria(hashtags: string[]): string {
  for (const tag of hashtags) {
    const upper = tag.toUpperCase()
    if (upper in HASHTAG_CATEGORIA) return HASHTAG_CATEGORIA[upper]
  }
  return 'Comic'
}

function embedDiagnostic(msg: Record<string, unknown>): string {
  const lines: string[] = []

  lines.push(`id=${msg.id as string}`)
  lines.push(`type=${msg.type as number ?? '?'}`)
  lines.push(`channel_id=${msg.channel_id as string}`)
  lines.push(`guild_id=${msg.guild_id as string ?? '?'}`)
  lines.push(`webhook_id=${msg.webhook_id as string ?? 'ninguno'}`)
  lines.push(`pinned=${msg.pinned as boolean ?? false}`)
  lines.push(`flags=${msg.flags as number ?? 0}`)
  lines.push(`timestamp=${(msg.timestamp as string ?? '').slice(0, 30)}`)

  const ref = msg.message_reference as Record<string, unknown> | undefined
  if (ref) lines.push(`message_reference=${JSON.stringify(ref)}`)

  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  lines.push(`embeds=${embeds?.length ?? 0}`)

  if (embeds && embeds.length > 0) {
    const e = embeds[0]
    const keys = Object.keys(e)
    lines.push(`embed_keys=[${keys.join(',')}]`)

    const t = e.title as string | undefined
    lines.push(`embed.title="${(t ?? '').slice(0, 80)}"`)

    const d = e.description as string | undefined
    lines.push(`embed.description.length=${(d ?? '').length}`)
    lines.push(`embed.description="${(d ?? '').slice(0, 150)}"`)

    const img = e.image as Record<string, unknown> | undefined
    lines.push(`embed.image.url="${(img?.url as string ?? '').slice(0, 100)}"`)

    const thumb = e.thumbnail as Record<string, unknown> | undefined
    lines.push(`embed.thumbnail.url="${(thumb?.url as string ?? '').slice(0, 100)}"`)

    const url = e.url as string | undefined
    lines.push(`embed.url="${(url ?? '').slice(0, 100)}"`)

    const fields = e.fields as Array<Record<string, unknown>> | undefined
    lines.push(`embed.fields=${fields?.length ?? 0}`)
    if (fields && fields.length > 0) {
      const f = fields[0]
      lines.push(`field[0].name="${(f.name as string ?? '').slice(0, 80)}"`)
      lines.push(`field[0].value="${(f.value as string ?? '').slice(0, 80)}"`)
    }
  }

  const content = msg.content as string | undefined
  lines.push(`msg.content.length=${(content ?? '').length}`)
  lines.push(`msg.content="${(content ?? '').slice(0, 100)}"`)

  const attachments = msg.attachments as Array<Record<string, unknown>> | undefined
  lines.push(`attachments=${attachments?.length ?? 0}`)

  if (attachments && attachments.length > 0) {
    const a = attachments[0]
    lines.push(`att[0].url="${(a.url as string ?? '').slice(0, 100)}"`)
    lines.push(`att[0].content_type="${a.content_type as string ?? '?'}"`)
  }

  // referenced_message (cuando el embed está en el mensaje original al que responde)
  const refMsg = msg.referenced_message as Record<string, unknown> | undefined
  if (refMsg) {
    lines.push(`--- referenced_message ---`)
    const refEmbeds = refMsg.embeds as Array<Record<string, unknown>> | undefined
    lines.push(`ref.embeds=${refEmbeds?.length ?? 0}`)
    if (refEmbeds && refEmbeds.length > 0) {
      const re = refEmbeds[0]
      lines.push(`ref.embed.title="${(re.title as string ?? '').slice(0, 80)}"`)
      lines.push(`ref.embed.description="${(re.description as string ?? '').slice(0, 150)}"`)
    }
  }

  return lines.join('\n')
}

export async function GET() {
  return new NextResponse(
    '✅ Discord Interactions Endpoint activo. Solo acepta POST de Discord. El error 405 en navegador es esperado.',
    { status: 200 }
  )
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

      processImport(messageUrl, hashtag, interaction.token, botToken)

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
  try {
    const parsed = parseMessageLink(messageUrl)
    if (!parsed) {
      await sendFollowUp(interactionToken, '❌ URL inválida. Debe ser: https://discord.com/channels/guild/channel/message', botToken)
      return
    }

    const msg = await fetchDiscordMessage(parsed.channelId, parsed.messageId, botToken)
    if (!msg) {
      await sendFollowUp(interactionToken, '❌ No se pudo obtener el mensaje. Verifica que el bot tenga permiso "Leer historial de mensajes" en el canal.', botToken)
      return
    }

    const titulo = extractTitle(msg)
    if (!titulo) {
      const diag = embedDiagnostic(msg)
      await sendFollowUp(interactionToken, `❌ No se pudo extraer título.\n\`\`\`\n${diag}\n\`\`\``, botToken)
      return
    }

    const descripcionRaw = extractDescription(msg)
    const link_descarga = extractDownloadLink(msg) || ''
    const imageUrl = extractImageUrl(msg)

    let url_portada = ''

    if (imageUrl) {
      try {
        const imgController = new AbortController()
        const imgTimeout = setTimeout(() => imgController.abort(), 4000)
        const imageRes = await fetch(imageUrl, { signal: imgController.signal })
        clearTimeout(imgTimeout)

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

    const hashtagLimpio = hashtag.replace(/^#/, '').trim()
    const hashtags = hashtagLimpio ? [hashtagLimpio] : []
    const categoria = deducirCategoria(hashtags)
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
        hashtags,
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
  } catch (err) {
    console.error('[Discord] processImport error:', err)
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    sendFollowUp(interactionToken, `❌ Error: ${msg}`, botToken)
  }
}
