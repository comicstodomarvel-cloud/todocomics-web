import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAdminFromRequest, hasPermission } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdminFromRequest(request)
  if (!hasPermission(user, 'usuarios')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  const admin = getSupabaseAdmin()
  const updates: Record<string, unknown> = {}

  if (body.display_name?.trim()) {
    updates.display_name = body.display_name.trim()
  }

  if (body.permissions && typeof body.permissions === 'object') {
    updates.permissions = body.permissions
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('admins')
    .update(updates)
    .eq('id', id)
    .eq('role', 'editor')
    .select('id, username, display_name, role, permissions, created_at')
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
  if (!hasPermission(user, 'usuarios')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params

  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('admins')
    .delete()
    .eq('id', id)
    .eq('role', 'editor')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
