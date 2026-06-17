/**
 * Script para generar una StringSession de gramjs.
 *
 * Modo bot (default):
 *   node scripts/generate-session.cjs
 *
 * Modo usuario (necesario para leer historial del canal):
 *   node scripts/generate-session.cjs user
 *
 * Requisitos:
 *   - TELEGRAM_API_ID y TELEGRAM_API_HASH en .env.local
 *   - En modo bot: TELEGRAM_BOT_TOKEN en .env.local
 *   - En modo usuario: una cuenta de Telegram que sea miembro del canal
 */

const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const { Logger } = require('telegram/extensions')
const { config } = require('dotenv')
const { resolve } = require('path')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

function prompt(query) {
  return new Promise((resolve) => readline.question(query, resolve))
}

config({ path: resolve(process.cwd(), '.env.local') })

const apiId = parseInt(process.env.TELEGRAM_API_ID || '')
const apiHash = process.env.TELEGRAM_API_HASH || ''
const botToken = process.env.TELEGRAM_BOT_TOKEN || ''

if (!apiId || !apiHash) {
  console.error('❌ TELEGRAM_API_ID y TELEGRAM_API_HASH deben estar en .env.local')
  console.error('   Obtenlos en https://my.telegram.org/apps')
  process.exit(1)
}

async function main() {
  const isUser = process.argv[2] === 'user'
  Logger.setLevel('errors')

  if (isUser) {
    console.log('🔑 Modo usuario - se usará una cuenta de Telegram para leer el historial del canal.')
    console.log('   La cuenta debe ser miembro del canal @marveltodocomics\n')

    const phoneNumber = await prompt('📱 Número de teléfono (ej: +584241234567): ')
    if (!phoneNumber) {
      console.error('❌ Número requerido')
      process.exit(1)
    }

    const session = new StringSession('')
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
    })

    await client.start({
      phoneNumber: async () => phoneNumber,
      phoneCode: async () => await prompt('🔢 Código de verificación (llegó a Telegram): '),
      password: async () => await prompt('🔑 Contraseña de 2FA (si aplica, sino Enter): '),
      onError: (err) => console.error('❌ Error de autenticación:', err.message),
    })
    console.log('✅ Conectado como usuario')

    readline.close()

    const sessionString = client.session.save()
    console.log('\n📋 Copia esta línea a .env.local:')
    console.log(`TELEGRAM_SESSION="${sessionString}"`)
    console.log('\n⚠️  También agregá esta línea a .env.local:')
    console.log('TELEGRAM_SESSION_TYPE=user')

    await client.disconnect()
    console.log('✅ Desconectado')
  } else {
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN debe estar en .env.local para modo bot')
      process.exit(1)
    }

    const session = new StringSession('')
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
    })

    await client.start({ botAuthToken: botToken })
    console.log('✅ Conectado como bot')

    readline.close()

    const sessionString = client.session.save()
    console.log('\n📋 Copia esta línea a .env.local:')
    console.log(`TELEGRAM_SESSION="${sessionString}"`)

    await client.disconnect()
    console.log('✅ Desconectado')
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.message || err)
  process.exit(1)
})
