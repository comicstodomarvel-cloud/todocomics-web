import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getSessionId(request: NextRequest): string | null {
  return request.headers.get('x-session-id')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contenidoId = searchParams.get('contenidoId')
  const sessionId = getSessionId(request)

  if (!contenidoId) {
    return NextResponse.json({ error: 'contenidoId es requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('votos')
    .select('valor, session_id')
    .eq('contenido_id', contenidoId)

  if (error) {
    console.error('Error al obtener votos:', error.message)
    return NextResponse.json({ error: 'Error al cargar votos' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ promedio: null, total: 0, miVoto: null })
  }

  const total = data.length
  const suma = data.reduce((acc, v) => acc + v.valor, 0)
  const promedio = Math.round((suma / total) * 10) / 10

  let miVoto: number | null = null
  if (sessionId) {
    const userVote = data.find((v) => v.session_id === sessionId)
    if (userVote) {
      miVoto = userVote.valor
    }
  }

  return NextResponse.json({ promedio, total, miVoto })
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request)
    if (!sessionId) {
      return NextResponse.json({ error: 'x-session-id requerido' }, { status: 400 })
    }

    const { contenidoId, valor } = await request.json()

    if (!contenidoId || typeof contenidoId !== 'string') {
      return NextResponse.json({ error: 'contenidoId requerido' }, { status: 400 })
    }

    const voto = parseInt(valor)
    if (isNaN(voto) || voto < 1 || voto > 5) {
      return NextResponse.json({ error: 'valor debe ser entre 1 y 5' }, { status: 400 })
    }

    const { error: existingError, data: existing } = await supabase
      .from('votos')
      .select('id')
      .eq('contenido_id', contenidoId)
      .eq('session_id', sessionId)
      .maybeSingle()

    if (existingError) {
      console.error('Error al verificar voto existente:', existingError.message)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: 'Ya votaste este contenido' }, { status: 409 })
    }

    const { error: insertError } = await supabase
      .from('votos')
      .insert({ contenido_id: contenidoId, valor: voto, session_id: sessionId })

    if (insertError) {
      console.error('Error al registrar voto:', insertError.message)
      return NextResponse.json({ error: 'Error al registrar voto' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
