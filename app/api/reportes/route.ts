import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getSessionId(request: NextRequest): string | null {
  return request.headers.get('x-session-id')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const adminKey = searchParams.get('key')

  if (adminKey) {
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: reportes, error } = await supabase
      .from('reportes_links')
      .select('*')
      .order('fecha', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Error al cargar reportes' }, { status: 500 })
    }

    const contenidoIds = [...new Set(reportes.map((r) => r.contenido_id))]

    const { data: contenidos } = await supabase
      .from('contenido')
      .select('id, titulo, url_portada, link_descarga')
      .in('id', contenidoIds)

    const contentMap = new Map(contenidos?.map((c) => [c.id, c]) ?? [])

    const grouped: Record<string, {
      contenido_id: string
      titulo: string
      url_portada: string
      link_descarga: string
      reportes: typeof reportes
      estado: string
    }> = {}

    for (const r of reportes) {
      if (!grouped[r.contenido_id]) {
        const c = contentMap.get(r.contenido_id)
        grouped[r.contenido_id] = {
          contenido_id: r.contenido_id,
          titulo: c?.titulo ?? '—',
          url_portada: c?.url_portada ?? '',
          link_descarga: c?.link_descarga ?? '',
          reportes: [],
          estado: r.estado,
        }
      }
      grouped[r.contenido_id].reportes.push(r)
    }

    return NextResponse.json(Object.values(grouped))
  }

  const { data, error } = await supabase
    .from('reportes_links')
    .select('contenido_id')
    .eq('estado', 'verificado')

  if (error) {
    return NextResponse.json({ caidos: [] })
  }

  return NextResponse.json({ caidos: data?.map((r) => r.contenido_id) ?? [] })
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request)
    if (!sessionId) {
      return NextResponse.json({ error: 'x-session-id requerido' }, { status: 400 })
    }

    const { contenidoId, comentario } = await request.json()

    if (!contenidoId || typeof contenidoId !== 'string') {
      return NextResponse.json({ error: 'contenidoId requerido' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('reportes_links')
      .select('id')
      .eq('contenido_id', contenidoId)
      .eq('session_id', sessionId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Ya reportaste este link' }, { status: 409 })
    }

    const { error } = await supabase
      .from('reportes_links')
      .insert({
        contenido_id: contenidoId,
        session_id: sessionId,
        comentario: typeof comentario === 'string' ? comentario.slice(0, 200) : '',
      })

    if (error) {
      return NextResponse.json({ error: 'Error al reportar' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { contenidoId, estado } = await request.json()

    if (!contenidoId || typeof contenidoId !== 'string') {
      return NextResponse.json({ error: 'contenidoId requerido' }, { status: 400 })
    }

    if (!['pendiente', 'verificado', 'resuelto', 'falso'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('reportes_links')
      .update({ estado })
      .eq('contenido_id', contenidoId)

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
