import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { HASHTAG_CATEGORIA } from '@/lib/hashtags'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('contenido')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      }
      console.error('[api/contenido/[id]] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/contenido/[id]] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = request.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { titulo, descripcion, link_descarga, url_portada, hashtag } = body

    const admin = getSupabaseAdmin()

    const updates: Record<string, string | string[]> = {}

    if (titulo !== undefined) {
      if (typeof titulo !== 'string' || !titulo.trim()) {
        return NextResponse.json({ error: 'El título no puede estar vacío' }, { status: 400 })
      }
      updates.titulo = titulo.trim()
    }

    if (descripcion !== undefined) {
      updates.descripcion = (descripcion || '').trim()
    }

    if (link_descarga !== undefined) {
      updates.link_descarga = (link_descarga || '').trim()
    }

    if (hashtag !== undefined) {
      const hashtagLimpio = (hashtag || '').replace(/^#/, '').trim()
      updates.hashtags = hashtagLimpio ? [hashtagLimpio] : []
      const upperHashtag = hashtagLimpio.toUpperCase()
      if (upperHashtag in HASHTAG_CATEGORIA) {
        updates.categoria = HASHTAG_CATEGORIA[upperHashtag]
      }
    }

    let url_portada_final = ''

    if (url_portada !== undefined) {
      if (typeof url_portada === 'string' && url_portada.startsWith('http')) {
        try {
          const imgController = new AbortController()
          const imgTimeout = setTimeout(() => imgController.abort(), 4000)
          const imageRes = await fetch(url_portada, { signal: imgController.signal })
          clearTimeout(imgTimeout)

          if (imageRes.ok) {
            const imageBuffer = await imageRes.arrayBuffer()
            const { uploadImageBytesToSupabase } = await import('@/lib/upload-image')
            const filename = `portada-${Date.now()}.jpg`
            url_portada_final = await uploadImageBytesToSupabase(imageBuffer, filename)
            updates.url_portada = url_portada_final || url_portada
          } else {
            updates.url_portada = url_portada
            url_portada_final = url_portada
          }
        } catch (err) {
          console.error('[api/contenido/[id]] Error descargando portada:', err)
          updates.url_portada = url_portada
          url_portada_final = url_portada
        }
      } else {
        updates.url_portada = (url_portada || '').trim()
        url_portada_final = updates.url_portada as string
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const { error } = await admin
      .from('contenido')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('[api/contenido/[id]] Error al actualizar:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response: Record<string, unknown> = { ok: true }
    if (url_portada_final) response.url_portada_final = url_portada_final
    return NextResponse.json(response)
  } catch (err) {
    console.error('[api/contenido/[id]] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
