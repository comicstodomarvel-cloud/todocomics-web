import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 🔐 Verificar clave de administrador para seguridad
    const adminKey = request.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const now = new Date()
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000).toISOString()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString()

    const [onlineRes, visitsTodayRes, visitsWeekRes, reportsRes, monthlyVisitsRes] = await Promise.all([
      supabase.from('presencia').select('*', { count: 'exact', head: true }).gte('ultima_vista', twoMinutesAgo),
      supabase.from('visitas').select('*', { count: 'exact', head: true }).gte('fecha', startOfToday),
      supabase.from('visitas').select('fecha, contenido_id').gte('fecha', sevenDaysAgo).order('fecha', { ascending: false }),
      supabase.from('reportes_links').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('visitas').select('contenido_id').gte('fecha', startOfMonth),
    ])

    const online = onlineRes.count ?? 0
    const visitsToday = visitsTodayRes.count ?? 0
    const pendingReports = reportsRes.count ?? 0

    // Agrupación de visitas semanales
    const visitsByDay: Record<string, number> = {}
    for (const v of visitsWeekRes.data ?? []) {
      const day = v.fecha.slice(0, 10)
      visitsByDay[day] = (visitsByDay[day] || 0) + 1
    }

    const days: { date: string; count: number; label: string }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      const labels = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
      days.push({ date: key, count: visitsByDay[key] || 0, label: labels[d.getDay()] })
    }

    // Top contenido del mes
    const visitCounts = new Map<string, number>()
    for (const v of monthlyVisitsRes.data ?? []) {
      visitCounts.set(v.contenido_id, (visitCounts.get(v.contenido_id) || 0) + 1)
    }

    const topEntries = [...visitCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const topContent = topEntries.map(([id, count]) => ({
      id,
      titulo: '',
      url_portada: '',
      categoria: '',
      visits: count,
    }))

    if (topEntries.length > 0) {
      const ids = topEntries.map(([id]) => id)
      const { data: contentData } = await supabase.from('contenido').select('id, titulo, url_portada, categoria').in('id', ids)
      const contentMap = new Map((contentData ?? []).map((c) => [c.id, c]))
      for (const entry of topContent) {
        const info = contentMap.get(entry.id)
        if (info) {
          entry.titulo = info.titulo
          entry.url_portada = info.url_portada
          entry.categoria = info.categoria
        }
      }
    }

    // Contenido reciente
    const { data: recentContent } = await supabase
      .from('contenido')
      .select('id, titulo')
      .order('fecha_creacion', { ascending: false })
      .limit(5)

    // Reportes recientes de links caídos
    const { data: recentReports } = await supabase
      .from('reportes_links')
      .select('contenido_id, creado_en')
      .eq('estado', 'pendiente')
      .order('creado_en', { ascending: false })
      .limit(5)

    let recentReportsWithTitles: { contenido_id: string; titulo: string; creado_en: string }[] = []
    if (recentReports && recentReports.length > 0) {
      const ids = [...new Set(recentReports.map((r) => r.contenido_id))]
      const { data: reportContent } = await supabase.from('contenido').select('id, titulo').in('id', ids)
      const titleMap = new Map((reportContent ?? []).map((c) => [c.id, c.titulo]))
      recentReportsWithTitles = recentReports.map((r) => ({
        contenido_id: r.contenido_id,
        titulo: titleMap.get(r.contenido_id) ?? 'Desconocido',
        creado_en: r.creado_en,
      }))
    }

    // 📡 Métricas avanzadas desde request_logs (Seguro ante inexistencia de tabla)
    let errors404Today = 0
    let recent404s: any[] = []
    let suspiciousIps: any[] = []
    let requestLogsActive = false

    try {
      const supabaseAdmin = getSupabaseAdmin()
      
      const [errors404Res, recent404sRes, logsRecentRes] = await Promise.all([
        supabaseAdmin.from('request_logs').select('*', { count: 'exact', head: true }).eq('status', 404).gte('created_at', startOfToday),
        supabaseAdmin.from('request_logs').select('path, user_agent, created_at, ip').eq('status', 404).order('created_at', { ascending: false }).limit(5),
        supabaseAdmin.from('request_logs').select('ip, path, created_at').gte('created_at', fifteenMinutesAgo),
      ])

      if (!errors404Res.error) {
        requestLogsActive = true
        errors404Today = errors404Res.count ?? 0
        recent404s = recent404sRes.data ?? []

        // Detección de sospechosos de scraping en JS
        const ipCounts = new Map<string, { count: number; paths: Set<string> }>()
        for (const log of logsRecentRes.data ?? []) {
          const current = ipCounts.get(log.ip) || { count: 0, paths: new Set<string>() }
          current.count += 1
          current.paths.add(log.path)
          ipCounts.set(log.ip, current)
        }

        suspiciousIps = [...ipCounts.entries()]
          .map(([ip, data]) => ({
            ip,
            count: data.count,
            pathsCount: data.paths.size,
          }))
          .filter((item) => item.count > 25) // Más de 25 peticiones en 15 min a APIs/recursos es inusual
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      }
    } catch {
      // Silencioso por si no existe la tabla
    }

    return NextResponse.json({
      online,
      visitsToday,
      visitsWeek: days,
      totalVisitsWeek: visitsWeekRes.data?.length ?? 0,
      pendingReports,
      topContent,
      recentContent: (recentContent ?? []).map((c) => ({ id: c.id, titulo: c.titulo })),
      recentReports: recentReportsWithTitles,
      // Nuevos campos
      requestLogsActive,
      errors404Today,
      recent404s,
      suspiciousIps,
    })
  } catch (e) {
    console.error('Error en stats de monitoreo:', e)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
