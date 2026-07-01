import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkAdminFromRequest, requireAdminRole } from '@/lib/admin-auth'

export async function GET() {
  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .order('orden', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const user = await checkAdminFromRequest(request)
  if (!requireAdminRole(user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { pregunta, respuesta, orden } = body

  if (!pregunta?.trim() || !respuesta?.trim()) {
    return NextResponse.json(
      { error: 'La pregunta y la respuesta son obligatorias' },
      { status: 400 }
    )
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('faq')
    .insert({
      pregunta: pregunta.trim(),
      respuesta: respuesta.trim(),
      orden: orden ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
