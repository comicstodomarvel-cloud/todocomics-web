import { NextRequest, NextResponse } from 'next/server'
import { checkDuplicates } from '@/lib/data'

export async function GET(request: NextRequest) {
  const titulo = request.nextUrl.searchParams.get('titulo') || ''

  if (!titulo.trim()) {
    return NextResponse.json({ duplicados: [] })
  }

  try {
    const duplicados = await checkDuplicates(titulo)
    return NextResponse.json({ duplicados })
  } catch (err) {
    console.error('[api/check-duplicate] Error:', err)
    return NextResponse.json({ duplicados: [] })
  }
}
