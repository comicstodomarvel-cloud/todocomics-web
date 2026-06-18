import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json()

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('presencia')
      .upsert(
        { session_id, ultima_vista: new Date().toISOString() },
        { onConflict: 'session_id' }
      )

    if (error) {
      console.error('Error al registrar heartbeat:', error.message)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('presencia')
      .select('*', { count: 'exact', head: true })
      .gte('ultima_vista', twoMinutesAgo)

    if (countError) {
      console.error('Error al contar presencia:', countError.message)
      return NextResponse.json({ online: 0 })
    }

    return NextResponse.json({ online: count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
