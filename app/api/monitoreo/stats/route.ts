import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000).toISOString()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [onlineRes, visitsTodayRes, visitsWeekRes, reportsRes, topRes, monthlyVisitsRes] = await Promise.all([
      supabase.from('presencia').select('*', { count: 'exact', head: true }).gte('ultima_vista', twoMinutesAgo),
      supabase.from('visitas').select('*', { count: 'exact', head: true }).gte('fecha', startOfToday),
      supabase.from('visitas').select('fecha, contenido_id').gte('fecha', sevenDaysAgo).order('fecha', { ascending: false }),
      supabase.from('reportes_links').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('contenido').select('id, titulo, url_portada, categoria').order('fecha_creacion', { ascending: false }).limit(10),
      supabase.from('visitas').select('contenido_id').gte('fecha', startOfMonth),
    ])

    const online = onlineRes.count ?? 0
    const visitsToday = visitsTodayRes.count ?? 0
    const pendingReports = reportsRes.count ?? 0

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

    const { data: recentContent } = await supabase
      .from('contenido')
      .select('id, titulo')
      .order('fecha_creacion', { ascending: false })
      .limit(5)

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

    return NextResponse.json({
      online,
      visitsToday,
      visitsWeek: days,
      totalVisitsWeek: visitsWeekRes.data?.length ?? 0,
      pendingReports,
      topContent,
      recentContent: (recentContent ?? []).map((c) => ({ id: c.id, titulo: c.titulo })),
      recentReports: recentReportsWithTitles,
    })
  } catch (e) {
    console.error('Error en stats de monitoreo:', e)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
