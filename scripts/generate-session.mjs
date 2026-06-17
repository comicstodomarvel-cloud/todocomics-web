/**
 * Script para generar una StringSession de gramjs.
 *
 * Uso:
 *   1. Configurar TELEGRAM_API_ID y TELEGRAM_API_HASH en .env.local
 *   2. node scripts/generate-session.mjs
 *   3. Copiar la sesión generada a .env.local como TELEGRAM_SESSION
 *
 * Requisitos: El bot debe ser admin del canal -1001406494973
 */

import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { Logger } from 'telegram/extensions'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const apiId = parseInt(process.env.TELEGRAM_API_ID || '')
const apiHash = process.env.TELEGRAM_API_HASH || ''
const botToken = process.env.TELEGRAM_BOT_TOKEN || ''

if (!apiId || !apiHash) {
  console.error('❌ TELEGRAM_API_ID y TELEGRAM_API_HASH deben estar en .env.local')
  console.error('   Obtenlos en https://my.telegram.org/apps')
  process.exit(1)
}

if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN debe estar en .env.local')
  process.exit(1)
}

const session = new StringSession('')
Logger.setLevel('errors')

const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
})

await client.start({ botAuthToken: botToken })
console.log('✅ Conectado como bot')

const sessionString = client.session.save()
console.log('\n📋 Copia esta línea a .env.local:')
console.log(`TELEGRAM_SESSION="${sessionString}"`)

await client.disconnect()
console.log('✅ Desconectado')
