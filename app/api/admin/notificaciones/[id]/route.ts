import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (typeof body.leida === 'boolean') {
      updates.leida = body.leida
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('admin_notificaciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[api/admin/notificaciones/[id]] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[api/admin/notificaciones/[id]] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
