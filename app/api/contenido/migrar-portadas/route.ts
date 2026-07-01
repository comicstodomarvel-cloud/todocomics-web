import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { uploadImageBytesToSupabase } from '@/lib/upload-image'
import { checkAdminFromRequest, requireAdminRole } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const user = await checkAdminFromRequest(request)
  if (!requireAdminRole(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let sharp: any
  try {
    sharp = (await import('sharp')).default
  } catch {
    return NextResponse.json({ error: 'Sharp no está disponible en este entorno' }, { status: 500 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  const resultados: { id: string; titulo: string; ok: boolean; error?: string }[] = []

  try {
    const { data: posts, error } = await supabaseAdmin
      .from('contenido')
      .select('id, titulo, url_portada')
      .ilike('url_portada', '%.webp')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Error al consultar DB: ' + error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ mensaje: 'No hay portadas .webp para migrar', procesados: 0 })
    }

    for (const post of posts) {
      try {
        const webpUrl = post.url_portada
        if (!webpUrl || !webpUrl.startsWith('http')) {
          resultados.push({ id: post.id, titulo: post.titulo, ok: false, error: 'URL inválida' })
          continue
        }

        const res = await fetch(webpUrl, { signal: AbortSignal.timeout(10000) })
        if (!res.ok) {
          resultados.push({ id: post.id, titulo: post.titulo, ok: false, error: `HTTP ${res.status} al descargar` })
          continue
        }

        const webpBuffer = Buffer.from(await res.arrayBuffer())

        let jpegBuffer: Buffer
        try {
          jpegBuffer = await sharp(webpBuffer).jpeg({ quality: 90 }).toBuffer()
        } catch (sharpErr) {
          resultados.push({
            id: post.id,
            titulo: post.titulo,
            ok: false,
            error: `Sharp no pudo convertir WebP: ${sharpErr instanceof Error ? sharpErr.message : 'error desconocido'}`,
          })
          continue
        }

        const nuevaUrl = await uploadImageBytesToSupabase(jpegBuffer, `portada-${post.id}.jpg`)

        if (!nuevaUrl) {
          resultados.push({ id: post.id, titulo: post.titulo, ok: false, error: 'Error al subir JPEG a Supabase' })
          continue
        }

        const { error: updateError } = await supabaseAdmin
          .from('contenido')
          .update({ url_portada: nuevaUrl })
          .eq('id', post.id)

        if (updateError) {
          resultados.push({ id: post.id, titulo: post.titulo, ok: false, error: 'DB update: ' + updateError.message })
          continue
        }

        resultados.push({ id: post.id, titulo: post.titulo, ok: true })
      } catch (err) {
        resultados.push({
          id: post.id,
          titulo: post.titulo,
          ok: false,
          error: err instanceof Error ? err.message : 'Error inesperado',
        })
      }
    }

    const ok = resultados.filter((r) => r.ok).length
    const fallos = resultados.filter((r) => !r.ok).length

    return NextResponse.json({
      procesados: resultados.length,
      ok,
      fallos,
      detalles: resultados,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 })
  }
}
