import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { Api } from 'telegram'
import bigInt from 'big-integer'

const CHAT_ID = '-1001406494973'

const apiId = parseInt(process.env.TELEGRAM_API_ID || '0')
const apiHash = process.env.TELEGRAM_API_HASH || ''
const session = process.env.TELEGRAM_SESSION || ''

if (!apiId || !apiHash || !session) {
  console.error('Missing env vars')
  process.exit(1)
}

const client = new TelegramClient(new StringSession(session), apiId, apiHash, { connectionRetries: 5 })
await client.connect()

const result = await client.invoke(new Api.messages.GetHistory({
  peer: CHAT_ID, offsetId: 0, offsetDate: 0, addOffset: 0, limit: 3, maxId: 0, minId: 0, hash: bigInt(0)
}))
const msgs = result.messages.filter(m => m.className === 'Message')
console.log('Total:', result.count)
for (const m of msgs) {
  console.log('ID:', m.id, '| Date:', new Date(m.date*1000).toISOString(), '| Text:', (m.message||'').substring(0,60))
}

const r2 = await client.invoke(new Api.messages.GetHistory({
  peer: CHAT_ID, offsetId: 0, offsetDate: 0, addOffset: 0, limit: 1, maxId: 79, minId: 79, hash: bigInt(0)
}))
console.log('Msg 79: count=' + r2.count + ' msgs=' + r2.messages.length)
if (r2.messages.length > 0) console.log('  Found ID:', r2.messages[0].id)

await client.disconnect()
