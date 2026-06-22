const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');
const bigInt = require('big-integer');
const CHAT_ID = '-1001406494973';
(async () => {
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_SESSION),
    parseInt(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH,
    { connectionRetries: 5 }
  );
  await client.connect();
  console.log('Connected!');
  const result = await client.invoke(new Api.messages.GetHistory({
    peer: CHAT_ID, offsetId: 0, offsetDate: 0, addOffset: 0, limit: 3, maxId: 0, minId: 0, hash: bigInt(0)
  }));
  console.log('Total:', result.count);
  const msgs = result.messages.filter(m => m.className === 'Message');
  for (const m of msgs) {
    console.log('Recent ID:', m.id, 'text:', (m.message||'').substring(0,50));
  }
  // Try to find message 79
  const r1 = await client.invoke(new Api.messages.GetHistory({
    peer: CHAT_ID, offsetId: 79, offsetDate: 0, addOffset: 0, limit: 1, maxId: 0, minId: 0, hash: bigInt(0)
  }));
  console.log('offsetId=79:', r1.messages.filter(m=>m.className==='Message').length, 'msgs');
  const r2 = await client.invoke(new Api.messages.GetHistory({
    peer: CHAT_ID, offsetId: 0, offsetDate: 0, addOffset: 0, limit: 1, maxId: 79, minId: 0, hash: bigInt(0)
  }));
  const m2 = r2.messages.filter(m => m.className==='Message');
  console.log('maxId=79:', m2.length, m2.length > 0 ? 'ID=' + m2[0].id : '');
  const r3 = await client.invoke(new Api.messages.GetHistory({
    peer: CHAT_ID, offsetId: 0, offsetDate: 0, addOffset: 0, limit: 100, maxId: 0, minId: 0, hash: bigInt(0)
  }));
  const m3 = r3.messages.filter(m => m.className==='Message');
  console.log('Oldest of 100:', m3[m3.length-1].id, new Date(m3[m3.length-1].date*1000).toISOString());
  await client.disconnect();
})();
