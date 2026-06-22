import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface PostItem {
  id: string
  titulo: string | null
  descripcion: string | null
  url_portada: string | null
  link_descarga: string | null
  categoria: string | null
  hashtags: string[] | null
  fecha_creacion: string | null
}

interface PostIssue {
  id: string
  titulo: string | null
  descripcion: string | null
  url_portada: string | null
  link_descarga: string | null
  categoria: string | null
  hashtags: string[] | null
  fecha_creacion: string | null
  campos_vacios: string[]
  portada_valida: boolean | null
}

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error, count } = await supabaseAdmin
      .from('contenido')
      .select('*', { count: 'exact' })
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('[api/revisar] Error al consultar contenido:', error)
      return NextResponse.json({ error: 'Error al consultar base de datos' }, { status: 500 })
    }

    const posts = (data as PostItem[]) ?? []
    const sinTitulo: PostIssue[] = []
    const sinDescripcion: PostIssue[] = []
    const sinPortada: PostIssue[] = []
    const portadaRota: PostIssue[] = []
    const sinLink: PostIssue[] = []

    const batchSize = 5
    const headPromises: (() => Promise<void>)[] = []

    for (const post of posts) {
      const camposVacios: string[] = []
      if (!post.titulo?.trim()) camposVacios.push('titulo')
      if (!post.descripcion?.trim()) camposVacios.push('descripcion')
      if (!post.url_portada?.trim()) camposVacios.push('url_portada')
      if (!post.link_descarga?.trim()) camposVacios.push('link_descarga')

      if (camposVacios.length === 0) continue

      const issue: PostIssue = { ...post, campos_vacios: camposVacios, portada_valida: null }

      if (camposVacios.includes('titulo')) sinTitulo.push(issue)
      if (camposVacios.includes('descripcion')) sinDescripcion.push(issue)
      if (camposVacios.includes('url_portada')) sinPortada.push(issue)
      if (camposVacios.includes('link_descarga')) sinLink.push(issue)
    }

    const postsWithPortada = posts.filter((p) => p.url_portada?.trim())
    for (const post of postsWithPortada.slice(0, 100)) {
      headPromises.push(async () => {
        try {
          const url = post.url_portada!

          // WebP files from old pipeline are corrupt even if HTTP 200
          if (url.endsWith('.webp')) {
            portadaRota.push({ ...post, campos_vacios: ['url_portada'], portada_valida: false })
            return
          }

          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 3000)
          const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
          clearTimeout(timeout)
          if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) {
            portadaRota.push({ ...post, campos_vacios: ['url_portada'], portada_valida: false })
          }
        } catch {
          portadaRota.push({ ...post, campos_vacios: ['url_portada'], portada_valida: false })
        }
      })
    }

    for (let i = 0; i < headPromises.length; i += batchSize) {
      await Promise.all(headPromises.slice(i, i + batchSize).map((fn) => fn()))
    }

    const allIds = new Set<string>()
    const allIssues: PostIssue[] = []
    for (const p of [...sinTitulo, ...sinDescripcion, ...sinPortada, ...sinLink, ...portadaRota]) {
      if (!allIds.has(p.id)) {
        allIds.add(p.id)
        allIssues.push(p)
      }
    }

    return NextResponse.json({
      total: count ?? posts.length,
      con_issues: allIssues.length,
      sin_titulo: sinTitulo,
      sin_descripcion: sinDescripcion,
      sin_portada: sinPortada,
      portada_rota: portadaRota,
      sin_link: sinLink,
      todos: allIssues,
    })
  } catch (err) {
    console.error('[api/revisar] Error inesperado:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
