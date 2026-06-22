import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const adminKey = request.headers.get('x-admin-key')

  // Admin: devolver todas las peticiones
  if (!sessionId) {
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('peticiones')
      .select('*')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  }

  // Usuario: devolver solo sus peticiones, paginadas
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))
  const from = (page - 1) * limit
  const to = from + limit - 1

  const countQuery = supabase
    .from('peticiones')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  const pendientesQuery = supabase
    .from('peticiones')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('estado', 'pendiente')

  const dataQuery = supabase
    .from('peticiones')
    .select('*')
    .eq('session_id', sessionId)
    .order('fecha_creacion', { ascending: false })
    .range(from, to)

  const [{ count }, { count: pendientes }, { data, error }] = await Promise.all([countQuery, pendientesQuery, dataQuery])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    pendientes: pendientes ?? 0,
    hasMore: count !== null ? from + limit < count : false,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, editorial, nombre_comic, numero_volumen, link_portada, comentarios } = body

    if (!session_id) {
      return NextResponse.json({ error: 'session_id es obligatorio' }, { status: 400 })
    }

    if (!editorial?.trim()) {
      return NextResponse.json({ error: 'La editorial es obligatoria' }, { status: 400 })
    }

    if (!nombre_comic?.trim()) {
      return NextResponse.json({ error: 'El nombre del cómic es obligatorio' }, { status: 400 })
    }

    if (!link_portada?.trim()) {
      return NextResponse.json({ error: 'El link de la portada es obligatorio' }, { status: 400 })
    }

    if (!link_portada.startsWith('https://')) {
      return NextResponse.json({ error: 'El link debe comenzar con https://' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { data, error } = await admin
      .from('peticiones')
      .insert({
        session_id,
        editorial: editorial.trim(),
        nombre_comic: nombre_comic.trim(),
        numero_volumen: numero_volumen?.trim() || null,
        link_portada: link_portada.trim(),
        comentarios: comentarios?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notificar al admin
    ;(async () => {
      try {
        await getSupabaseAdmin().from('admin_notificaciones').insert({
          tipo: 'peticion',
          titulo: `📩 Nueva petición: ${nombre_comic.trim()}`,
          detalle: editorial.trim() ? `Editorial: ${editorial.trim()}` : null,
          link: `/admin/peticiones?key=${process.env.ADMIN_KEY}`,
          metadata: { peticion_id: data.id },
        })
      } catch {
        // silencio
      }
    })()

    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('[api/peticiones] POST error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
