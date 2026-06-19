import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id') || ''

  try {
    if (!sessionId) {
      return NextResponse.json({ items: [] })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('favoritos')
      .select('contenido_id, created_at')
      .is('usuario_id', null)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[api/favoritos] GET error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const ids = (data ?? []).map((f) => f.contenido_id)

    if (ids.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const { data: contentData } = await getSupabaseAdmin()
      .from('contenido')
      .select('*')
      .in('id', ids)

    // Sort by the order in ids
    const contentMap = new Map((contentData ?? []).map((c: any) => [c.id, c]))
    const sorted = ids.map((id) => contentMap.get(id)).filter(Boolean)

    return NextResponse.json({ items: sorted })
  } catch (err) {
    console.error('[api/favoritos] GET error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contenido_id, session_id } = body

    if (!contenido_id) {
      return NextResponse.json({ error: 'contenido_id es obligatorio' }, { status: 400 })
    }

    if (!session_id) {
      return NextResponse.json({ error: 'session_id es obligatorio' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Check if already favorited
    const { data: existing } = await admin
      .from('favoritos')
      .select('id')
      .is('usuario_id', null)
      .eq('session_id', session_id)
      .eq('contenido_id', contenido_id)
      .maybeSingle()

    if (existing) {
      // Toggle off — remove
      const { error: delError } = await admin
        .from('favoritos')
        .delete()
        .eq('id', existing.id)

      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 500 })
      }

      return NextResponse.json({ favorito: false })
    }

    // Toggle on — insert
    const { error: insError } = await admin.from('favoritos').insert({ contenido_id, session_id })

    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 })
    }

    return NextResponse.json({ favorito: true })
  } catch (err) {
    console.error('[api/favoritos] POST error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
