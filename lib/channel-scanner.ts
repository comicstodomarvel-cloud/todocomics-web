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
  entities?: Array<{ offset: number; length: number; type: string; url?: string }>
}

export interface ScanResult {
  messages: ScannedMessage[]
  totalFetched: number
}

/**
 * Escanea el historial del canal usando MTProto, con paginación automática.
 * @param limit Máximo de mensajes a obtener (default 50, -1 para todo).
 * @param dryRun Si es true, solo cuenta mensajes sin parsear el cuerpo (no implementado aún).
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
    const messages = (raw.messages as any[])
      .filter((msg: any): msg is any => msg?.className === 'Message')

    if (messages.length === 0) {
      hasMore = false
      break
    }

    for (const msg of messages) {
      let text = ''
      let caption = ''
      let hasPhoto = false
      let entities: ScannedMessage['entities'] = []

      if (msg.message) {
        text = msg.message
      }

      if (msg.media && 'className' in msg.media) {
        if (msg.media.className === 'MessageMediaPhoto') {
          hasPhoto = true
          if (msg.message) {
            text = msg.message
          }
        }
      }

      const msgEntities = (msg.entities as any[] | undefined) || []
      entities = msgEntities.map((e: any) => ({
        offset: e.offset,
        length: e.length,
        type: e.className?.replace('MessageEntity', '').toLowerCase() || '',
        url: e.url,
      }))

      allMessages.push({
        id: msg.id,
        text,
        caption,
        date: msg.date,
        hasPhoto,
        entities: entities.length > 0 ? entities : undefined,
      })
    }

    // Paginar: siguiente lote empieza desde el message_id más viejo - 1
    offsetId = messages[messages.length - 1].id

    if (limit !== -1 && allMessages.length >= limit) break
  }

  return {
    messages: allMessages,
    totalFetched: allMessages.length,
  }
}
