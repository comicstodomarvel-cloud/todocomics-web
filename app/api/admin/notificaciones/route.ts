import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const soloNoLeidas = searchParams.get('unread') === 'true'
  const limite = parseInt(searchParams.get('limit') ?? '20', 10)

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase.from('admin_notificaciones').select('*', { count: 'exact' })

    if (soloNoLeidas) {
      query = query.eq('leida', false)
    }

    const { data, error, count } = await query
      .order('fecha_creacion', { ascending: false })
      .limit(limite)

    if (error) {
      console.error('[api/admin/notificaciones] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: data ?? [], total: count ?? 0 })
  } catch (err) {
    console.error('[api/admin/notificaciones] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
