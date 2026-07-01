import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { HASHTAG_CATEGORIA } from '@/lib/hashtags'
import { checkAdminFromRequest, hasPermission } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await checkAdminFromRequest(request)
    if (!hasPermission(user, 'importar')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { titulo, descripcion, hashtag, link_descarga, url_portada } = body

    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }

    const hashtagLimpio = (hashtag || '').replace(/^#/, '').trim()
    const hashtags = hashtagLimpio ? [hashtagLimpio] : []
    const upperHashtag = hashtagLimpio.toUpperCase()
    const categoria = upperHashtag in HASHTAG_CATEGORIA
      ? HASHTAG_CATEGORIA[upperHashtag]
      : 'Comic'

    let url_portada_final = url_portada || ''

    if (url_portada && typeof url_portada === 'string' && url_portada.startsWith('http')) {
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
        }
      } catch (err) {
        console.error('[api/importar] Error descargando portada:', err)
      }
    }

    const admin = getSupabaseAdmin()
    const descripcionFinal = (descripcion || 'Sin descripción').trim()

    const { data: nuevo, error } = await admin
      .from('contenido')
      .insert({
        titulo: titulo.trim(),
        descripcion: descripcionFinal,
        url_portada: url_portada_final,
        categoria,
        hashtags,
        link_descarga: (link_descarga || '').trim(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[api/importar] Error al insertar:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: nuevo.id })
  } catch (err) {
    console.error('[api/importar] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
