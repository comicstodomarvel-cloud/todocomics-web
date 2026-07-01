import { getSupabaseAdmin } from './supabase-admin'
import { esCategoriaValida } from './hashtags'
import { parseTelegramContent, sanitizarTexto } from '@/app/api/telegram/route'
import { uploadImageBytesToSupabase } from './upload-image'
import type { ScannedMessage } from './channel-scanner'

export interface BatchImportResult {
  imported: number
  skipped: {
    update: number
    sinCategoria: number
    duplicado: number
  }
  updatesVinculados: number
  errores: number
  detalles: string[]
}

/**
 * Procesa un lote de mensajes escaneados del canal.
 * Filtra #update, sin categoría, y duplicados, luego importa.
 */
export async function batchImport(
  messages: ScannedMessage[],
  dryRun: boolean = false
): Promise<BatchImportResult> {
  const admin = getSupabaseAdmin()

  const result: BatchImportResult = {
    imported: 0,
    skipped: { update: 0, sinCategoria: 0, duplicado: 0 },
    updatesVinculados: 0,
    errores: 0,
    detalles: [],
  }

  for (const msg of messages) {
    const texto = (msg.caption || msg.text || '').trim()
    if (!texto) {
      result.skipped.sinCategoria++
      result.detalles.push(`[${msg.id}] Saltado: sin texto`)
      continue
    }

    // Extraer hashtags
    const hashtags: string[] = []
    const hashtagMatches = texto.match(/#\w+/g)
    if (hashtagMatches) {
      hashtagMatches.forEach((h) => hashtags.push(h.replace('#', '').toLowerCase()))
    }

    const uniqueHashtags = [...new Set(hashtags)]

    // 1. Saltar #update
    if (uniqueHashtags.includes('update')) {
      result.skipped.update++
      result.detalles.push(`[${msg.id}] Saltado: #update`)
      continue
    }

    // 2. Saltar si no tiene categoría válida
    if (!esCategoriaValida(uniqueHashtags)) {
      result.skipped.sinCategoria++
      result.detalles.push(`[${msg.id}] Saltado: sin categoría (hashtags: ${uniqueHashtags.join(', ') || 'ninguno'})`)
      continue
    }

    // 3. Importar
    if (!dryRun) {
      try {
        // Reconstruir un objeto compatible con parseTelegramContent
        // No pasamos photo para evitar llamadas fallidas a la API de Telegram.
        // La portada se sube desde msg.photoBytes (descargado vía MTProto) más abajo.
        const telegramMsg = {
          message_id: msg.id,
          chat: { id: -1001406494973, type: 'channel' },
          text: msg.text || undefined,
          caption: msg.caption || undefined,
          entities: msg.entities as any,
          caption_entities: msg.entities as any,
          photo: undefined,
          date: msg.date,
        }

        let parsed = await parseTelegramContent(telegramMsg as any)
        if (!parsed) {
          result.errores++
          result.detalles.push(`[${msg.id}] El mensaje no contiene texto`)
          continue
        }

        // Subir portada desde bytes (MTProto) si existe
        let urlPortadaFinal = parsed.url_portada
        if (msg.photoBytes && !urlPortadaFinal) {
          try {
            const filename = `portada-${msg.id}-${Date.now()}.jpg`
            urlPortadaFinal = await uploadImageBytesToSupabase(msg.photoBytes, filename)
            if (urlPortadaFinal) {
              console.log(`[batchImport] Portada subida desde bytes para msg ${msg.id}:`, urlPortadaFinal)
            }
          } catch (uploadErr) {
            console.error(`[batchImport] Error subiendo portada para msg ${msg.id}:`, uploadErr)
          }
        }

        // 4. Verificar duplicado por telegram_message_id + link_descarga
        const existingById = await admin
          .from('contenido')
          .select('id')
          .eq('telegram_message_id', msg.id)
          .maybeSingle()

        if (existingById?.data) {
          result.skipped.duplicado++
          result.detalles.push(`[${msg.id}] Saltado: ya importado (ID ${existingById.data.id})`)
          continue
        }

        if (parsed.link_descarga) {
          const existingByLink = await admin
            .from('contenido')
            .select('id')
            .eq('link_descarga', parsed.link_descarga)
            .maybeSingle()

          if (existingByLink?.data) {
            result.skipped.duplicado++
            result.detalles.push(`[${msg.id}] Saltado: ya importado por link_descarga (ID ${existingByLink.data.id})`)
            continue
          }
        }

        const { data: nuevoContenido, error: insertError } = await admin
          .from('contenido')
          .insert({
            titulo: sanitizarTexto(parsed.titulo),
            descripcion: sanitizarTexto(parsed.descripcion),
            url_portada: urlPortadaFinal,
            categoria: parsed.categoria,
            hashtags: parsed.hashtags,
            link_descarga: sanitizarTexto(parsed.link_descarga),
            telegram_message_id: msg.id,
          })
          .select('id')
          .single()

        if (insertError) {
          result.errores++
          result.detalles.push(`[${msg.id}] Error al insertar: ${insertError.message}`)
          continue
        }

        result.imported++

        // Vincular orphans
        try {
          const { data: orphansPorLink } = await admin
            .from('actualizaciones')
            .select('id')
            .eq('contenido_id', null)
            .filter('metadata->>link_post_original', 'like', `%/${msg.id}`)

          const { data: orphansPorId } = await admin
            .from('actualizaciones')
            .select('id')
            .eq('contenido_id', null)
            .eq('metadata->>telegram_message_id_original', msg.id.toString())

          const idsToLink = new Set<string>()
          for (const o of orphansPorLink || []) idsToLink.add(o.id)
          for (const o of orphansPorId || []) idsToLink.add(o.id)

          if (idsToLink.size > 0) {
            const { error: linkError } = await admin
              .from('actualizaciones')
              .update({ contenido_id: nuevoContenido.id })
              .in('id', [...idsToLink])

            if (!linkError) {
              result.updatesVinculados += idsToLink.size
              result.detalles.push(`[${msg.id}] Importado + ${idsToLink.size} orphan(s) vinculado(s)`)
            }
          } else {
            result.detalles.push(`[${msg.id}] Importado exitosamente`)
          }
        } catch (linkErr) {
          result.detalles.push(`[${msg.id}] Importado, error al vincular orphans: ${linkErr instanceof Error ? linkErr.message : 'Unknown'}`)
        }
      } catch (err) {
        result.errores++
        result.detalles.push(`[${msg.id}] Error inesperado: ${err instanceof Error ? err.message : 'Unknown'}`)
      }
    } else {
      result.imported++
      result.detalles.push(`[${msg.id}] Se importaría (dry run)`)
    }
  }

  return result
}
