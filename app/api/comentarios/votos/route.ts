import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getSessionId(request: NextRequest): string | null {
  return request.headers.get('x-session-id')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const comentarioId = searchParams.get('comentarioId')
  const sessionId = getSessionId(request)

  if (!comentarioId) {
    return NextResponse.json({ error: 'comentarioId requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comentarios_votos')
    .select('tipo, session_id')
    .eq('comentario_id', comentarioId)

  if (error) {
    console.error('Error al obtener votos:', error.message)
    return NextResponse.json({ likes: 0, dislikes: 0, miVoto: null })
  }

  const likes = data.filter((v) => v.tipo === 'like').length
  const dislikes = data.filter((v) => v.tipo === 'dislike').length
  let miVoto: 'like' | 'dislike' | null = null

  if (sessionId) {
    const userVote = data.find((v) => v.session_id === sessionId)
    if (userVote) miVoto = userVote.tipo as 'like' | 'dislike'
  }

  return NextResponse.json({ likes, dislikes, miVoto })
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request)
    if (!sessionId) {
      return NextResponse.json({ error: 'x-session-id requerido' }, { status: 400 })
    }

    const { comentarioId, tipo } = await request.json()

    if (!comentarioId || typeof comentarioId !== 'string') {
      return NextResponse.json({ error: 'comentarioId requerido' }, { status: 400 })
    }

    if (!tipo || !['like', 'dislike'].includes(tipo)) {
      return NextResponse.json({ error: 'tipo debe ser like o dislike' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('comentarios_votos')
      .select('id, tipo')
      .eq('comentario_id', comentarioId)
      .eq('session_id', sessionId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error al verificar voto:', fetchError.message)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    if (existing) {
      if (existing.tipo === tipo) {
        const { error: delError } = await supabase
          .from('comentarios_votos')
          .delete()
          .eq('id', existing.id)

        if (delError) {
          console.error('Error al eliminar voto:', delError.message)
          return NextResponse.json({ error: 'Error al eliminar voto' }, { status: 500 })
        }
      } else {
        const { error: updError } = await supabase
          .from('comentarios_votos')
          .update({ tipo })
          .eq('id', existing.id)

        if (updError) {
          console.error('Error al actualizar voto:', updError.message)
          return NextResponse.json({ error: 'Error al actualizar voto' }, { status: 500 })
        }
      }
    } else {
      const { error: insError } = await supabase
        .from('comentarios_votos')
        .insert({ comentario_id: comentarioId, session_id: sessionId, tipo })

      if (insError) {
        console.error('Error al insertar voto:', insError.message)
        return NextResponse.json({ error: 'Error al votar' }, { status: 500 })
      }
    }

    const { data: updated, error: countError } = await supabase
      .from('comentarios_votos')
      .select('tipo, session_id')
      .eq('comentario_id', comentarioId)

    if (countError) {
      return NextResponse.json({ likes: 0, dislikes: 0, miVoto: null })
    }

    const likes = updated.filter((v) => v.tipo === 'like').length
    const dislikes = updated.filter((v) => v.tipo === 'dislike').length
    let miVoto: 'like' | 'dislike' | null = null
    const userVote = updated.find((v) => v.session_id === sessionId)
    if (userVote) miVoto = userVote.tipo as 'like' | 'dislike'

    return NextResponse.json({ likes, dislikes, miVoto })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
