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
  const res = await fetch(url, {
    headers: { Authorization: `Bot ${botToken}` },
  })

  if (!res.ok) {
    console.error('[discord-utils] Error fetching message:', res.status, await res.text())
    return null
  }

  return res.json()
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

export function extractImageUrl(msg: Record<string, unknown>): string | null {
  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  if (!embeds || embeds.length === 0) return null

  const embed = embeds[0]

  const image = embed.image as Record<string, unknown> | undefined
  if (image?.url && typeof image.url === 'string') return image.url

  const thumbnail = embed.thumbnail as Record<string, unknown> | undefined
  if (thumbnail?.url && typeof thumbnail.url === 'string') return thumbnail.url

  return null
}

export function extractTitle(msg: Record<string, unknown>): string {
  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  if (embeds && embeds.length > 0) {
    const embed = embeds[0]
    if (embed.title && typeof embed.title === 'string') return embed.title
  }
  return ''
}

export function extractDescription(msg: Record<string, unknown>): string {
  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  if (embeds && embeds.length > 0) {
    const embed = embeds[0]
    if (embed.description && typeof embed.description === 'string') return embed.description
  }
  return ''
}

export const PATRON_LINK =
  /https?:\/\/(?:www\.)?(?:[0-9]+terabox|terabox|teraboxapp|teraboxurl|freeterabox|videy|videyyy|freevidey|videynow|bit\.ly|bitly|mega\.nz|mega|drive\.google|mediafire|short\.url|tinyurl|ow\.ly|is\.gd)[^\s)"'\]]+/i

export function extractDownloadLink(msg: Record<string, unknown>): string {
  const embeds = msg.embeds as Array<Record<string, unknown>> | undefined
  if (!embeds || embeds.length === 0) return ''

  const embed = embeds[0]

  if (embed.url && typeof embed.url === 'string' && PATRON_LINK.test(embed.url)) {
    return embed.url
  }

  const description = embed.description
  if (description && typeof description === 'string') {
    const match = description.match(PATRON_LINK)
    if (match) return match[0].replace(/[.,;:)\]}>]+$/, '')
  }

  const fields = embed.fields as Array<Record<string, unknown>> | undefined
  if (fields) {
    for (const field of fields) {
      if (field.value && typeof field.value === 'string') {
        const match = field.value.match(PATRON_LINK)
        if (match) return match[0].replace(/[.,;:)\]}>]+$/, '')
      }
    }
  }

  return ''
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
