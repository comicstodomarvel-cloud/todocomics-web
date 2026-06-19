/**
 * Script para registrar el slash command /import en el servidor de Discord.
 *
 * Uso:
 *   1. Asegúrate de tener DISCORD_BOT_TOKEN y DISCORD_GUILD_ID y DISCORD_APP_ID
 *      en tu .env.local (o exportados como variables de entorno)
 *   2. node scripts/register-commands.js
 */

const { config } = require('dotenv')
const path = require('path')

config({ path: path.resolve(__dirname, '../.env.local') })

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const DISCORD_APP_ID = process.env.DISCORD_APP_ID
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID

if (!DISCORD_BOT_TOKEN || !DISCORD_APP_ID || !DISCORD_GUILD_ID) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   DISCORD_BOT_TOKEN:', !!DISCORD_BOT_TOKEN)
  console.error('   DISCORD_APP_ID:', !!DISCORD_APP_ID)
  console.error('   DISCORD_GUILD_ID:', !!DISCORD_GUILD_ID)
  process.exit(1)
}

const command = {
  name: 'import',
  description: 'Importa un embed de Discord a la web',
  options: [
    {
      type: 3,
      name: 'link',
      description: 'URL del mensaje de Discord (click derecho → Copiar enlace)',
      required: true,
    },
    {
      type: 3,
      name: 'hashtag',
      description: 'Categoría del contenido en la web',
      required: true,
      choices: [
        { name: '#Comic', value: 'Comic' },
        { name: '#Manga', value: 'Manga' },
        { name: '#Pelicula', value: 'Pelicula' },
        { name: '#Serie', value: 'Serie' },
        { name: '#Libro', value: 'Libro' },
      ],
    },
  ],
}

async function main() {
  const url = `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/guilds/${DISCORD_GUILD_ID}/commands`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify(command),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`❌ Error ${res.status}:`, text)
    process.exit(1)
  }

  const data = await res.json()
  console.log(`✅ Comando /import registrado en el servidor`)
  console.log(`   ID: ${data.id}`)
  console.log(`   Nombre: ${data.name}`)
}

main()
