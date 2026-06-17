import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '5')))

    const { data: updates, error } = await supabase
      .from('actualizaciones')
      .select(`
        *,
        contenido:contenido_id (
          id,
          titulo,
          categoria,
          url_portada
        )
      `)
      .order('fecha', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Updates Latest API] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ updates })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[Updates Latest API] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
