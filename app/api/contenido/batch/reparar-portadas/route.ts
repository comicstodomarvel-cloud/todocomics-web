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
      .select('id, titulo, url_portada, telegram_message_id')
      .ilike('url_portada', '%.webp')
      .not('telegram_message_id', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ mensaje: 'No hay portadas .webp para reparar' })
    }

    const client = await getClient()
    const resultados: Array<{ id: string; titulo: string; ok: boolean; error?: string }> = []

    for (const post of posts) {
      try {
        const msgId = post.telegram_message_id as number

        const result = await client.invoke(
          new Api.messages.GetHistory({
            peer: CHAT_ID,
            offsetId: 0,
            offsetDate: 0,
            addOffset: 0,
            limit: 1,
            maxId: msgId,
            minId: msgId,
            hash: bigInt(0),
          })
        )

        const raw = result as any
        const messages = (raw.messages as any[] || []).filter(
          (m: any) => m?.className === 'Message'
        )

        if (messages.length === 0) {
          resultados.push({
            id: post.id,
            titulo: post.titulo,
            ok: false,
            error: `Mensaje ${msgId} no encontrado en el canal`,
          })
          continue
        }

        const msg = messages[0]
        let buffer: Buffer | undefined

        if (msg.media && msg.media.className === 'MessageMediaPhoto') {
          const downloaded = await client.downloadMedia(msg.media, {})
          if (downloaded) buffer = Buffer.from(downloaded as Uint8Array)
        } else if (
          msg.media &&
          msg.media.className === 'MessageMediaDocument' &&
          msg.media.document &&
          msg.media.document.mime_type &&
          (msg.media.document.mime_type as string).startsWith('image/')
        ) {
          const downloaded = await client.downloadMedia(msg.media, {})
          if (downloaded) buffer = Buffer.from(downloaded as Uint8Array)
        }

        if (!buffer) {
          resultados.push({
            id: post.id,
            titulo: post.titulo,
            ok: false,
            error: 'No se pudo descargar la foto del mensaje',
          })
          continue
        }

        const filename = `portada-${post.telegram_message_id}`
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

        resultados.push({
          id: post.id,
          titulo: post.titulo,
          ok: true,
        })
      } catch (err) {
        resultados.push({
          id: post.id,
          titulo: post.titulo,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    const ok = resultados.filter((r) => r.ok).length
    const fallos = resultados.filter((r) => !r.ok).length

    return NextResponse.json({
      total: resultados.length,
      ok,
      fallos,
      detalles: resultados,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
