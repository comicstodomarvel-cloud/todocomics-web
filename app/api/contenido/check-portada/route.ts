import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    if (!url) {
      return NextResponse.json({ error: 'Falta el parámetro url' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { count, error } = await admin
      .from('contenido')
      .select('id', { count: 'exact', head: true })
      .eq('url_portada', url)

    if (error) {
      console.error('[api/contenido/check-portada] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (err) {
    console.error('[api/contenido/check-portada] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
