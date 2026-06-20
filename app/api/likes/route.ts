import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contenidoId = searchParams.get('contenidoId')
  const sessionId = searchParams.get('session_id')
  const top = searchParams.get('top')

  // Ranking: devolver los contenidos con más likes
  if (top === 'true') {
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const { data, error } = await supabase
      .from('likes')
      .select('contenido_id, count:contenido_id')
      .order('contenido_id', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupar manualmente porque count(*) con group by no funciona bien con anon key
    const countMap = new Map<string, number>()
    for (const row of data ?? []) {
      countMap.set(row.contenido_id, (countMap.get(row.contenido_id) || 0) + 1)
    }

    const sorted = [...countMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id, count]) => ({ contenido_id: id, count }))

    return NextResponse.json(sorted)
  }

  // Like count y estado para un contenido específico
  if (!contenidoId) {
    return NextResponse.json({ error: 'contenidoId es requerido' }, { status: 400 })
  }

  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('contenido_id', contenidoId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let liked = false
  if (sessionId) {
    const { data: userLike } = await supabase
      .from('likes')
      .select('id')
      .eq('contenido_id', contenidoId)
      .eq('session_id', sessionId)
      .maybeSingle()

    liked = !!userLike
  }

  return NextResponse.json({ count: count ?? 0, liked })
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

    // Check if already liked
    const { data: existing } = await admin
      .from('likes')
      .select('id')
      .eq('contenido_id', contenido_id)
      .eq('session_id', session_id)
      .maybeSingle()

    if (existing) {
      // Unlike — remove
      const { error: delError } = await admin
        .from('likes')
        .delete()
        .eq('id', existing.id)

      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 500 })
      }

      const { count } = await admin
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('contenido_id', contenido_id)

      return NextResponse.json({ liked: false, count: count ?? 0 })
    }

    // Like — insert
    const { error: insError } = await admin
      .from('likes')
      .insert({ contenido_id, session_id })

    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 })
    }

    const { count } = await admin
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('contenido_id', contenido_id)

    return NextResponse.json({ liked: true, count: count ?? 0 })
  } catch (err) {
    console.error('[api/likes] POST error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
