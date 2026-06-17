import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    const { data: updates, error, count } = await supabase
      .from('actualizaciones')
      .select(`
        *,
        contenido:contenido_id (
          id,
          titulo,
          categoria,
          url_portada
        )
      `, { count: 'exact' })
      .order('fecha', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Updates API] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      updates,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[Updates API] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
