import { getSupabaseAdmin } from './supabase-admin'
import { esCategoriaValida } from './hashtags'
import { parseTelegramContent, sanitizarTexto } from '@/app/api/telegram/route'
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

    // 3. Verificar duplicado por telegram_message_id
    const { data: existing } = await admin
      .from('contenido')
      .select('id')
      .eq('telegram_message_id', msg.id)
      .maybeSingle()

    if (existing) {
      result.skipped.duplicado++
      result.detalles.push(`[${msg.id}] Saltado: ya importado (ID ${existing.id})`)
      continue
    }

    // 4. Importar
    if (!dryRun) {
      try {
        // Reconstruir un objeto compatible con parseTelegramContent
        const telegramMsg = {
          message_id: msg.id,
          chat: { id: -1001406494973, type: 'channel' },
          text: msg.text || undefined,
          caption: msg.caption || undefined,
          entities: msg.entities as any,
          caption_entities: msg.entities as any,
          photo: msg.hasPhoto ? ([{ file_id: '', file_unique_id: '' }] as any) : undefined,
          date: msg.date,
        }

        let parsed
        try {
          parsed = await parseTelegramContent(telegramMsg as any)
        } catch (parseErr) {
          result.errores++
          result.detalles.push(`[${msg.id}] Error al parsear: ${parseErr instanceof Error ? parseErr.message : 'Unknown'}`)
          continue
        }

        const { data: nuevoContenido, error: insertError } = await admin
          .from('contenido')
          .insert({
            titulo: sanitizarTexto(parsed.titulo),
            descripcion: sanitizarTexto(parsed.descripcion),
            url_portada: parsed.url_portada,
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
