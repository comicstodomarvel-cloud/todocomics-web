import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('presencia')
    .select('*', { count: 'exact', head: true })
    .gte('ultima_vista', twoMinutesAgo)

  if (error) {
    console.error('Error al obtener conteo online:', error.message)
    return NextResponse.json({ online: 0 })
  }

  return NextResponse.json({ online: count ?? 0 })
}
