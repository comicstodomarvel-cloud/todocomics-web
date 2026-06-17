import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { contenidoId } = await request.json()

    if (!contenidoId || typeof contenidoId !== 'string') {
      return NextResponse.json({ error: 'contenidoId es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('visitas')
      .insert({ contenido_id: contenidoId })

    if (error) {
      console.error('Error al registrar visita:', error.message)
      return NextResponse.json({ error: 'Error al registrar visita' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
