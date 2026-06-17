import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { Logger } from 'telegram/extensions'

let client: TelegramClient | null = null

export async function getClient(): Promise<TelegramClient> {
  if (client && client.connected) {
    return client
  }

  const apiId = parseInt(process.env.TELEGRAM_API_ID || '0')
  const apiHash = process.env.TELEGRAM_API_HASH || ''
  const sessionString = process.env.TELEGRAM_SESSION || ''
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!apiId || !apiHash) {
    throw new Error('TELEGRAM_API_ID y TELEGRAM_API_HASH son requeridos')
  }
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN es requerido')
  }
  if (!sessionString) {
    throw new Error('TELEGRAM_SESSION es requerida')
  }

  const session = new StringSession(sessionString)

  client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    deviceModel: 'TodoComics Web Server',
    appVersion: '1.0.0',
  })

  Logger.setLevel('errors')

  await client.start({
    botAuthToken: botToken,
  })

  console.log('[TelegramClient] Conectado como bot')
  return client
}

export async function closeClient() {
  if (client && client.connected) {
    await client.disconnect()
    client = null
    console.log('[TelegramClient] Desconectado')
  }
}
