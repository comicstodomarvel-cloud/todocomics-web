import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { path } = await request.json()
    if (!path) {
      return NextResponse.json({ error: 'path es requerido' }, { status: 400 })
    }

    // Ignorar recursos de Next.js, estáticos o favicons comunes para evitar ruido en logs
    const ignoreExtensions = ['.js', '.css', '.map', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json']
    if (ignoreExtensions.some((ext) => path.toLowerCase().endsWith(ext)) || path.startsWith('/_next/')) {
      return NextResponse.json({ success: true, ignored: true })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''

    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.from('request_logs').insert({
      ip,
      path: path.slice(0, 200),
      method: 'GET',
      user_agent: userAgent,
      status: 404
    })

    if (error) {
      console.error('Error al registrar log 404:', error.message)
      return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error en report-404:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
