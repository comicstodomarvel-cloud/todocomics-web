import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAdminFromRequest, requireAdminRole } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminFromRequest(request)
  if (!requireAdminRole(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { pregunta, respuesta, orden } = body

  const admin = getSupabaseAdmin()
  const updates: Record<string, unknown> = {}

  if (pregunta?.trim()) updates.pregunta = pregunta.trim()
  if (respuesta?.trim()) updates.respuesta = respuesta.trim()
  if (orden !== undefined) updates.orden = orden

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No hay campos para actualizar' },
      { status: 400 }
    )
  }

  const { data, error } = await admin
    .from('faq')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminFromRequest(request)
  if (!requireAdminRole(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const admin = getSupabaseAdmin()
  const { error } = await admin.from('faq').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
