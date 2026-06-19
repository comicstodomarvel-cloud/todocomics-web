export interface ParsedMessageLink {
  guildId: string
  channelId: string
  messageId: string
}

export function parseMessageLink(url: string): ParsedMessageLink | null {
  const pattern = /^https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/
  const match = url.match(pattern)
  if (!match) return null
  return { guildId: match[1], channelId: match[2], messageId: match[3] }
}

export function buildDiscordApiUrl(channelId: string, messageId: string): string {
  return `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`
}

export async function fetchDiscordMessage(
  channelId: string,
  messageId: string,
  botToken: string
): Promise<Record<string, unknown> | null> {
  const url = buildDiscordApiUrl(channelId, messageId)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bot ${botToken}` },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const body = await res.text()
      console.error('[discord-utils] Discord API error:', res.status, body)
      return null
    }

    return res.json()
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('[discord-utils] Timeout fetching Discord message (8s)')
      return null
    }
    console.error('[discord-utils] Fetch error:', err)
    return null
  }
}

export async function sendFollowUp(
  interactionToken: string,
  content: string,
  botToken: string
): Promise<void> {
  const url = `https://discord.com/api/v10/webhooks/${process.env.DISCORD_APP_ID}/${interactionToken}/messages/@original`
  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
    body: JSON.stringify({ content }),
  })
}

/** Limpia emojis personalizados de Discord: <a:nombre:id> y <:nombre:id> */
function stripDiscordEmoji(texto: string): string {
  return texto.replace(/<a?:\w+:\d+>/g, '').trim()
}

/** Recolecta todo el texto del mensaje sin modificar (content + embed) */
function collectRawText(msg: Record<string, unknown>): string {
  const partes: string[] = []

  if (msg.content && typeof msg.content === 'string' && msg.content.trim()) {
    partes.push(msg.content.trim())
  }

  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  if (embeds && embeds.length > 0) {
    const e = embeds[0]

    const titulo = e.title as string | undefined
    if (titulo) partes.push(titulo)

    const desc = e.description as string | undefined
    if (desc) partes.push(desc)

    const fields = e.fields as Array<Record<string, unknown>> | undefined
    if (fields) {
      for (const field of fields) {
        if (field.name && typeof field.name === 'string') partes.push(field.name as string)
        if (field.value && typeof field.value === 'string') partes.push(field.value as string)
      }
    }

    const author = e.author as Record<string, unknown> | undefined
    if (author?.name && typeof author.name === 'string') partes.push(author.name as string)

    const footer = e.footer as Record<string, unknown> | undefined
    if (footer?.text && typeof footer.text === 'string') partes.push(footer.text as string)
  }

  return partes.join('\n')
}

/** Texto limpio para humanos (sin emojis, sin formato markdown de links) */
function collectCleanText(msg: Record<string, unknown>): string {
  const raw = collectRawText(msg)
  return raw
    .replace(/<a?:\w+:\d+>/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .trim()
}

/** Extrae el título: primera línea no-vacía que no sea solo un emoji ni URL */
export function extractTitle(msg: Record<string, unknown>): string {
  const texto = collectCleanText(msg)
  const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean)

  for (const linea of lineas) {
    if (linea.length > 0 && !linea.startsWith('http')) {
      return linea
    }
  }

  return ''
}

/** Extrae la descripción: todo después de la línea del título */
export function extractDescription(msg: Record<string, unknown>): string {
  const texto = collectCleanText(msg)
  const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean)

  const titulo = extractTitle(msg)
  if (!titulo) return texto

  const idx = lineas.findIndex((l) => l === titulo)
  if (idx === -1) return ''

  return lineas.slice(idx + 1).join('\n')
}

export const PATRON_LINK =
  /https?:\/\/(?:www\.)?(?:[0-9]+terabox|terabox|teraboxapp|teraboxurl|freeterabox|videy|videyyy|freevidey|videynow|bit\.ly|bitly|mega\.nz|mega|drive\.google|mediafire|short\.url|tinyurl|ow\.ly|is\.gd)[^\s)"'\]]+/i

/** Extrae link de descarga del mensaje completo (markdown links incluidos) */
export function extractDownloadLink(msg: Record<string, unknown>): string {
  const raw = collectRawText(msg)

  // 1. Markdown links: [DESCARGA DIRECTA](https://bit.ly/xxx)
  const markdownRegex = /\[([^\]]*?)\]\s*\((https?:\/\/[^\s)]+)\)/gi
  let match
  while ((match = markdownRegex.exec(raw)) !== null) {
    const url = match[2]
    if (PATRON_LINK.test(url)) return url
  }

  // 2. embed.url
  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  if (embeds && embeds.length > 0) {
    const url = embeds[0].url as string | undefined
    if (url && PATRON_LINK.test(url)) return url
  }

  // 3. Regex sobre texto plano
  const regexMatch = raw.match(PATRON_LINK)
  if (regexMatch) return regexMatch[0].replace(/[.,;:)\]}>]+$/, '')

  return ''
}

/** Extrae URL de imagen del embed o attachments */
export function extractImageUrl(msg: Record<string, unknown>): string | null {
  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  if (embeds && embeds.length > 0) {
    const embed = embeds[0]

    const image = embed.image as Record<string, unknown> | undefined
    if (image?.url && typeof image.url === 'string') return image.url

    const thumbnail = embed.thumbnail as Record<string, unknown> | undefined
    if (thumbnail?.url && typeof thumbnail.url === 'string') return thumbnail.url
  }

  const attachments = msg.attachments as Array<Record<string, unknown>> | undefined
  if (attachments) {
    for (const att of attachments) {
      const ct = att.content_type as string | undefined
      const url = att.url as string | undefined
      if (url) {
        if (ct?.startsWith('image/')) return url
        if (!ct) return url
      }
    }
  }

  return null
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
