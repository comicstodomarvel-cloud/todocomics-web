import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getClient } from '@/lib/telegram-client'
import { uploadImageBytesToSupabase } from '@/lib/upload-image'
import { Api } from 'telegram'
import bigInt from 'big-integer'

const CHAT_ID = '-1001406494973'
const ADMIN_KEY = process.env.ADMIN_KEY || ''

export async function POST(request: Request) {
  if (request.headers.get('x-admin-key') !== ADMIN_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: posts, error } = await supabase
      .from('contenido')
      .select('id, titulo, url_portada, telegram_message_id, link_descarga')
      .ilike('url_portada', '%.webp')
      .not('link_descarga', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ mensaje: 'No hay portadas .webp para reparar' })
    }

    const client = await getClient()
    const linkToPost = new Map(posts.map((p) => [p.link_descarga, p]))

    const allLinks = [...linkToPost.keys()]
    const resultados: Array<{ id: string; titulo: string; ok: boolean; error?: string }> = []

    let offsetId = 0
    let scanned = 0
    const SCAN_LIMIT = 500

    while (scanned < SCAN_LIMIT && allLinks.length > 0) {
      const result = await client.invoke(
        new Api.messages.GetHistory({
          peer: CHAT_ID,
          offsetId,
          offsetDate: 0,
          addOffset: 0,
          limit: 100,
          maxId: 0,
          minId: 0,
          hash: bigInt(0),
        })
      )

      const raw = result as any
      const messages = (raw.messages as any[] || []).filter(
        (m: any) => m?.className === 'Message'
      )

      if (messages.length === 0) break

      for (const msg of messages) {
        scanned++
        const text: string = msg.message || ''
        const entities: any[] = msg.entities || []

        const urls: string[] = []
        for (const e of entities) {
          if (e.className?.includes('Url') || e.className?.includes('TextLink')) {
            urls.push(e.url || text.substring(e.offset, e.offset + e.length))
          }
        }

        const matchLink = allLinks.find((link) => urls.some((u) => u.includes(link)))
        if (!matchLink) continue

        const post = linkToPost.get(matchLink)!
        allLinks.splice(allLinks.indexOf(matchLink), 1)

        try {
          let buffer: Buffer | undefined

          if (msg.media && msg.media.className === 'MessageMediaPhoto') {
            const downloaded = await client.downloadMedia(msg.media, {})
            if (downloaded) buffer = Buffer.from(downloaded as Uint8Array)
          } else if (
            msg.media &&
            msg.media.className === 'MessageMediaDocument' &&
            msg.media.document?.mime_type?.startsWith('image/')
          ) {
            const downloaded = await client.downloadMedia(msg.media, {})
            if (downloaded) buffer = Buffer.from(downloaded as Uint8Array)
          }

          if (!buffer) {
            resultados.push({
              id: post.id,
              titulo: post.titulo,
              ok: false,
              error: `Msg ${msg.id} no tiene foto descargable`,
            })
            continue
          }

          const filename = `portada-${msg.id}`
          const nuevaUrl = await uploadImageBytesToSupabase(buffer, filename)

          if (!nuevaUrl) {
            resultados.push({
              id: post.id,
              titulo: post.titulo,
              ok: false,
              error: 'Fallo al subir imagen a Supabase',
            })
            continue
          }

          const { error: updateError } = await supabase
            .from('contenido')
            .update({ url_portada: nuevaUrl })
            .eq('id', post.id)

          if (updateError) {
            resultados.push({
              id: post.id,
              titulo: post.titulo,
              ok: false,
              error: `Subida OK pero fallo al actualizar DB: ${updateError.message}`,
            })
            continue
          }

          resultados.push({ id: post.id, titulo: post.titulo, ok: true })
        } catch (err) {
          resultados.push({
            id: post.id,
            titulo: post.titulo,
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }

      const lastId = messages[messages.length - 1].id
      if (lastId === offsetId) break
      offsetId = lastId
    }

    if (allLinks.length > 0) {
      for (const link of allLinks) {
        const post = linkToPost.get(link)!
        resultados.push({
          id: post.id,
          titulo: post.titulo,
          ok: false,
          error: `No se encontró en los últimos ${SCAN_LIMIT} mensajes del canal`,
        })
      }
    }

    const ok = resultados.filter((r) => r.ok).length
    const fallos = resultados.filter((r) => !r.ok).length

    return NextResponse.json({
      total: resultados.length,
      ok,
      fallos,
      escaneados: scanned,
      detalles: resultados,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
