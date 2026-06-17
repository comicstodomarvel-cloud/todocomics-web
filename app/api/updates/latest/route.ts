import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: updates, error } = await supabase
      .from('actualizaciones')
      .select(`
        *,
        contenido:contenido_id (
          titulo,
          categoria,
          url_portada
        )
      `)
      .order('fecha', { ascending: false })
      .limit(5)

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
