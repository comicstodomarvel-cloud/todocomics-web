import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword, checkAdminsExist } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const exists = await checkAdminsExist()
    if (exists) {
      return NextResponse.json({ error: 'Ya existe un administrador' }, { status: 400 })
    }

    const { username, password, display_name } = await request.json()

    if (!username || !password) {
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
        role: 'admin',
        display_name: display_name?.trim() || username.trim(),
      })
      .select('id, username, role, display_name')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'El usuario ya existe' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Error al crear administrador' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, user: data }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
