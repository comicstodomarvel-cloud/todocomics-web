import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Comment } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contenidoId = searchParams.get('contenidoId')
  const sessionId = request.headers.get('x-session-id')

  if (!contenidoId) {
    return NextResponse.json({ error: 'contenidoId es requerido' }, { status: 400 })
  }

  const { data: comments, error } = await supabase
    .from('comentarios')
    .select('*')
    .eq('contenido_id', contenidoId)
    .order('fecha', { ascending: false })

  if (error) {
    console.error('Error al cargar comentarios:', error.message)
    return NextResponse.json({ error: 'Error al cargar comentarios' }, { status: 500 })
  }

  if (!comments || comments.length === 0) {
    return NextResponse.json([])
  }

  const commentIds = comments.map((c) => c.id)

  const { data: votes } = await supabase
    .from('comentarios_votos')
    .select('comentario_id, tipo, session_id')
    .in('comentario_id', commentIds)

  const enriched: Array<Comment & { likes: number; dislikes: number; miVoto: 'like' | 'dislike' | null }> =
    comments.map((comment) => {
      const commentVotes = votes?.filter((v) => v.comentario_id === comment.id) ?? []
      const likes = commentVotes.filter((v) => v.tipo === 'like').length
      const dislikes = commentVotes.filter((v) => v.tipo === 'dislike').length
      let miVoto: 'like' | 'dislike' | null = null
      if (sessionId) {
        const userVote = commentVotes.find((v) => v.session_id === sessionId)
        if (userVote) miVoto = userVote.tipo as 'like' | 'dislike'
      }
      return { ...comment, likes, dislikes, miVoto }
    })

  return NextResponse.json(enriched)
}

export async function POST(request: NextRequest) {
  try {
    const { contenidoId, nickname, contenido } = await request.json()

    if (!contenidoId || typeof contenidoId !== 'string') {
      return NextResponse.json({ error: 'contenidoId requerido' }, { status: 400 })
    }

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return NextResponse.json({ error: 'nickname requerido' }, { status: 400 })
    }

    if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
      return NextResponse.json({ error: 'contenido requerido' }, { status: 400 })
    }

    if (contenido.length > 300) {
      return NextResponse.json({ error: 'Máximo 300 caracteres' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('comentarios')
      .insert({
        contenido_id: contenidoId,
        nickname: nickname.trim(),
        contenido: contenido.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear comentario:', error.message)
      return NextResponse.json({ error: 'Error al crear comentario' }, { status: 500 })
    }

    return NextResponse.json(data as Comment, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    }

    const { nickname, contenido } = await request.json()

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return NextResponse.json({ error: 'nickname requerido' }, { status: 400 })
    }

    if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
      return NextResponse.json({ error: 'contenido requerido' }, { status: 400 })
    }

    if (contenido.length > 300) {
      return NextResponse.json({ error: 'Máximo 300 caracteres' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('comentarios')
      .select('nickname')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
    }

    if (existing.nickname !== nickname.trim()) {
      return NextResponse.json({ error: 'Nickname incorrecto' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('comentarios')
      .update({ contenido: contenido.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar comentario:', error.message)
      return NextResponse.json({ error: 'Error al actualizar comentario' }, { status: 500 })
    }

    return NextResponse.json(data as Comment)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const nickname = request.headers.get('x-nickname') || searchParams.get('nickname')

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    }

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json({ error: 'nickname requerido' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('comentarios')
      .select('nickname')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
    }

    if (existing.nickname !== nickname) {
      return NextResponse.json({ error: 'Nickname incorrecto' }, { status: 403 })
    }

    const { error } = await supabase
      .from('comentarios')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar comentario:', error.message)
      return NextResponse.json({ error: 'Error al eliminar comentario' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
