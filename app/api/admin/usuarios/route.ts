import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAdminFromRequest, hasPermission, hashPassword } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const user = await checkAdminFromRequest(request)
  if (!hasPermission(user, 'usuarios')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('admins')
    .select('id, username, display_name, role, permissions, created_at')
    .eq('role', 'editor')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const user = await checkAdminFromRequest(request)
  if (!hasPermission(user, 'usuarios')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { username, password, display_name } = body

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const password_hash = await hashPassword(password)

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('admins')
      .insert({
        username: username.toLowerCase().trim(),
        password_hash,
        role: 'editor',
        display_name: display_name?.trim() || username.trim(),
        permissions: { sections: ['importar'] },
      })
      .select('id, username, display_name, role, permissions, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'El usuario ya existe' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
