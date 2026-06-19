import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { HASHTAG_FILTERS } from '@/lib/hashtags'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const categoria = searchParams.get('categoria')
  const hashtagId = searchParams.get('hashtag')
  const busqueda = searchParams.get('busqueda')
  const offset = (page - 1) * limit

  try {
    let query = supabase.from('contenido').select('*', { count: 'exact' })

    if (busqueda) {
      query = query.or(`titulo.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`)
    } else if (hashtagId) {
      const filterDef = HASHTAG_FILTERS.find((f) => f.id === hashtagId)
      if (!filterDef) {
        return NextResponse.json({ error: 'Filtro no encontrado' }, { status: 400 })
      }
      query = query.overlaps('hashtags', filterDef.search)
    } else if (categoria && categoria !== 'Todos') {
      query = query.eq('categoria', categoria)
    }

    const { data, error, count } = await query
      .order('fecha_creacion', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[api/contenido] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      items: data ?? [],
      page,
      limit,
      total: count ?? 0,
      hasMore: count ? offset + limit < count : false,
    })
  } catch (err) {
    console.error('[api/contenido] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
