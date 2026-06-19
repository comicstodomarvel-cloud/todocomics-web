import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id') || ''
  const authHeader = request.headers.get('authorization') || ''

  try {
    let userId: string | null = null

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    let query = getSupabaseAdmin()
      .from('favoritos')
      .select('contenido_id, created_at')

    if (userId) {
      query = query.eq('usuario_id', userId)
    } else if (sessionId) {
      query = query.is('usuario_id', null).eq('session_id', sessionId)
    } else {
      return NextResponse.json({ items: [] })
    }

    const { data, error } = await query.order('created_at', { ascending: false })

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
    const authHeader = request.headers.get('authorization') || ''

    if (!contenido_id) {
      return NextResponse.json({ error: 'contenido_id es obligatorio' }, { status: 400 })
    }

    let userId: string | null = null

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    const admin = getSupabaseAdmin()

    // Check if already favorited
    let checkQuery = admin.from('favoritos').select('id')
    if (userId) {
      checkQuery = checkQuery.eq('usuario_id', userId).eq('contenido_id', contenido_id)
    } else if (session_id) {
      checkQuery = checkQuery.is('usuario_id', null).eq('session_id', session_id).eq('contenido_id', contenido_id)
    } else {
      return NextResponse.json({ error: 'Debes iniciar sesión o proporcionar session_id' }, { status: 400 })
    }

    const { data: existing } = await checkQuery.maybeSingle()

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
    const insertData: Record<string, string> = { contenido_id }
    if (userId) insertData.usuario_id = userId
    else if (session_id) insertData.session_id = session_id

    const { error: insError } = await admin.from('favoritos').insert(insertData)

    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 })
    }

    return NextResponse.json({ favorito: true })
  } catch (err) {
    console.error('[api/favoritos] POST error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
