import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '5', 10)

  const { data: likes, error } = await supabase
    .from('likes')
    .select('contenido_id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const countMap = new Map<string, number>()
  for (const row of likes ?? []) {
    countMap.set(row.contenido_id, (countMap.get(row.contenido_id) || 0) + 1)
  }

  const sorted = [...countMap.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)

  if (sorted.length === 0) {
    return NextResponse.json([])
  }

  const ids = sorted.map(([id]) => id)

  const { data: content, error: contentError } = await supabase
    .from('contenido')
    .select('id, titulo, url_portada, categoria')
    .in('id', ids)

  if (contentError) {
    return NextResponse.json({ error: contentError.message }, { status: 500 })
  }

  const contentMap = new Map(content?.map((c) => [c.id, c]) ?? [])

  const result = sorted
    .map(([id, likes]) => {
      const item = contentMap.get(id)
      if (!item) return null
      return {
        id: item.id,
        titulo: item.titulo,
        portada_url: item.url_portada,
        categoria: item.categoria,
        likes,
      }
    })
    .filter(Boolean)

  return NextResponse.json(result)
}
