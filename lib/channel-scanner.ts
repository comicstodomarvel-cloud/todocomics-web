import bigInt from 'big-integer'
import { Api } from 'telegram'
import { getClient } from './telegram-client'

const CHAT_ID = '-1001406494973'

export interface ScannedMessage {
  id: number
  text: string
  caption: string
  date: number
  hasPhoto: boolean
  photoBytes?: Buffer
  entities?: Array<{ offset: number; length: number; type: string; url?: string }>
}

export interface ScanResult {
  messages: ScannedMessage[]
  totalFetched: number
}

function isImageMime(type: string): boolean {
  return type.startsWith('image/')
}

async function downloadPhoto(client: any, msg: any): Promise<Buffer | undefined> {
  try {
    if (msg.media && msg.media.className === 'MessageMediaPhoto') {
      const buffer = await client.downloadMedia(msg.media, {})
      if (buffer) return Buffer.from(buffer)
    }
    if (
      msg.media &&
      msg.media.className === 'MessageMediaDocument' &&
      msg.media.document &&
      msg.media.document.mime_type &&
      isImageMime(msg.media.document.mime_type)
    ) {
      const buffer = await client.downloadMedia(msg.media, {})
      if (buffer) return Buffer.from(buffer)
    }
  } catch (err) {
    console.error(`[scan] Error descargando imagen del mensaje ${msg.id}:`, err instanceof Error ? err.message : err)
  }
  return undefined
}

function extractMessageData(msg: any, photoBytes?: Buffer): ScannedMessage {
  let text = ''
  let caption = ''
  let hasPhoto = false

  if (msg.message) text = msg.message

  if (msg.media && 'className' in msg.media) {
    if (msg.media.className === 'MessageMediaPhoto') {
      hasPhoto = true
      if (msg.message) text = msg.message
    }
  }

  const msgEntities = (msg.entities as any[] | undefined) || []
  const entities = msgEntities
    .map((e: any) => {
      const rawType = e.className?.replace('MessageEntity', '').toLowerCase() || ''
      return {
        offset: e.offset,
        length: e.length,
        type: rawType === 'texturl' ? 'text_link' : rawType,
        url: e.url,
      }
    })
    .filter((e) => e.offset !== undefined)

  return {
    id: msg.id,
    text,
    caption,
    date: msg.date,
    hasPhoto,
    photoBytes,
    entities: entities.length > 0 ? entities : undefined,
  }
}

/**
 * Escanea el historial del canal desde el mensaje más reciente hacia atrás.
 * @param limit Máximo de mensajes a obtener (default 50, -1 para todo).
 */
export async function scanChannelHistory(limit: number = 50): Promise<ScanResult> {
  const client = await getClient()
  const allMessages: ScannedMessage[] = []
  const pageSize = 100
  let offsetId = 0
  let hasMore = true

  while (hasMore) {
    const remaining = limit === -1 ? pageSize : Math.min(pageSize, limit - allMessages.length)
    if (remaining <= 0) break

    const result = await client.invoke(
      new Api.messages.GetHistory({
        peer: CHAT_ID,
        offsetId,
        offsetDate: 0,
        addOffset: 0,
        limit: remaining,
        maxId: 0,
        minId: 0,
        hash: bigInt(0),
      })
    )

    const raw = result as any
    if (!raw.messages) {
      hasMore = false
      break
    }
    const messages = (raw.messages as any[]).filter(
      (msg: any): msg is any => msg?.className === 'Message'
    )

    if (messages.length === 0) {
      hasMore = false
      break
    }

    for (const msg of messages) {
      const photoBytes = await downloadPhoto(client, msg)
      allMessages.push(extractMessageData(msg, photoBytes))
    }

    offsetId = messages[messages.length - 1].id
    if (limit !== -1 && allMessages.length >= limit) break
  }

  return { messages: allMessages, totalFetched: allMessages.length }
}

/**
 * Escanea el historial del canal desde un message_id específico
 * hacia adelante (mensajes más nuevos), hasta el presente.
 * @param startMessageId ID del post desde donde empezar (incluido).
 * @param limit Máximo de mensajes a obtener (-1 para todos hasta el presente).
 */
export async function scanFromMessage(
  startMessageId: number,
  limit: number = -1
): Promise<ScanResult> {
  const client = await getClient()
  const allMessages: ScannedMessage[] = []
  const pageSize = 100
  let offsetId = 0
  let hasMore = true

  while (hasMore) {
    const remaining = limit === -1 ? pageSize : Math.min(pageSize, limit - allMessages.length)
    if (remaining <= 0) break

    const result = await client.invoke(
      new Api.messages.GetHistory({
        peer: CHAT_ID,
        offsetId,
        offsetDate: 0,
        addOffset: 0,
        limit: remaining,
        maxId: 0,
        minId: startMessageId,
        hash: bigInt(0),
      })
    )

    const raw = result as any
    if (!raw.messages) {
      hasMore = false
      break
    }
    const messages = (raw.messages as any[]).filter(
      (msg: any): msg is any => msg?.className === 'Message'
    )

    if (messages.length === 0) {
      hasMore = false
      break
    }

    for (const msg of messages) {
      const photoBytes = await downloadPhoto(client, msg)
      allMessages.push(extractMessageData(msg, photoBytes))
    }

    const oldestInPage = messages[messages.length - 1].id
    if (oldestInPage <= startMessageId) {
      hasMore = false
      break
    }
    offsetId = oldestInPage
  }

  // Ordenar de más antiguo a más nuevo
  allMessages.sort((a, b) => a.id - b.id)

  return { messages: allMessages, totalFetched: allMessages.length }
}
