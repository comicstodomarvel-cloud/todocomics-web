'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Users, Eye, AlertTriangle, TrendingUp, Activity, Shield, RefreshCw } from 'lucide-react'

type DayData = { date: string; count: number; label: string }
type TopItem = { id: string; titulo: string; url_portada: string; categoria: string; visits: number }
type RecentItem = { id: string; titulo: string }
type ReportItem = { contenido_id: string; titulo: string; creado_en: string }

type Stats = {
  online: number
  visitsToday: number
  visitsWeek: DayData[]
  totalVisitsWeek: number
  pendingReports: number
  topContent: TopItem[]
  recentContent: RecentItem[]
  recentReports: ReportItem[]
}

const MAX_BAR = 100

export default function MonitoreoPage() {
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key') || ''
    if (key) setAdminKey(key)
  }, [])

  function handleKeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!keyInput.trim()) return
    setAdminKey(keyInput)
    window.history.replaceState(null, '', `/admin/monitoreo?key=${keyInput}`)
  }

  const fetchStats = useCallback(async () => {
    if (!adminKey) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/monitoreo/stats', {
        headers: { 'x-admin-key': adminKey },
      })
      if (!res.ok) throw new Error('Error al cargar estadísticas')
      const data = await res.json()
      setStats(data)
    } catch (e) {
      setError('Error al cargar estadísticas')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    if (adminKey) fetchStats()
  }, [adminKey, fetchStats])

  const maxCount = stats ? Math.max(...stats.visitsWeek.map((d) => d.count), 1) : 1

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
        <form onSubmit={handleKeySubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-white">Monitoreo</h1>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Clave de administrador"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
          >
            Ingresar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin?key=${adminKey}`}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← Admin
            </Link>
            <h1 className="text-2xl font-bold text-white">Monitoreo</h1>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {loading && !stats && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 text-sm text-red-400">
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Users size={16} />
                  <span className="text-xs font-medium text-zinc-500">ONLINE AHORA</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.online}</p>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Eye size={16} />
                  <span className="text-xs font-medium text-zinc-500">VISITAS HOY</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.visitsToday}</p>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Activity size={16} />
                  <span className="text-xs font-medium text-zinc-500">VISITAS 7 DÍAS</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalVisitsWeek}</p>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-medium text-zinc-500">REPORTES PEND.</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Visitas 7 días */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
                <h2 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
                  <Activity size={15} className="text-amber-400" />
                  Visitas últimos 7 días
                </h2>
                <div className="flex items-end gap-2 h-32">
                  {stats.visitsWeek.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] text-zinc-500 font-medium">{day.count}</span>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500"
                        style={{ height: `${Math.max((day.count / maxCount) * 100, 4)}%` }}
                      />
                      <span className="text-[10px] text-zinc-600">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top contenido */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
                <h2 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-amber-400" />
                  Top contenido del mes
                </h2>
                {stats.topContent.length === 0 ? (
                  <p className="text-sm text-zinc-600">Sin datos aún</p>
                ) : (
                  <div className="space-y-2">
                    {stats.topContent.map((item, i) => (
                      <Link
                        key={item.id}
                        href={`/admin/editar?key=${adminKey}&id=${item.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                      >
                        <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                          {i + 1}
                        </span>
                        {item.url_portada && (
                          <img
                            src={item.url_portada}
                            alt=""
                            className="w-6 h-9 rounded object-cover border border-zinc-700/50 shrink-0"
                          />
                        )}
                        <span className="text-xs text-zinc-300 group-hover:text-zinc-100 truncate flex-1">
                          {item.titulo || 'Sin título'}
                        </span>
                        <span className="text-[10px] text-zinc-600 shrink-0 flex items-center gap-1">
                          <Eye size={10} /> {item.visits}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Reportes recientes */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-red-400" />
                    Reportes pendientes
                  </h2>
                  <Link
                    href={`/admin/reportes?key=${adminKey}`}
                    className="text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Gestionar →
                  </Link>
                </div>
                {stats.recentReports.length === 0 ? (
                  <p className="text-sm text-zinc-600">No hay reportes pendientes</p>
                ) : (
                  <div className="space-y-2">
                    {stats.recentReports.map((r) => (
                      <div key={r.contenido_id + (r.creado_en || '')} className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <Link
                          href={`/admin/editar?key=${adminKey}&id=${r.contenido_id}`}
                          className="text-zinc-300 hover:text-amber-400 truncate transition-colors"
                        >
                          {r.titulo}
                        </Link>
                        {r.creado_en && (
                          <span className="text-zinc-600 shrink-0 ml-auto">
                            {new Date(r.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Setup / Info */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
                <h2 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
                  <Shield size={15} className="text-zinc-500" />
                  Detección de amenazas
                </h2>

                <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3 mb-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Para habilitar detección de scraping y registro de errores 404,
                    creá la siguiente tabla en el SQL Editor de Supabase:
                  </p>
                  <pre className="mt-2 text-[10px] text-zinc-500 bg-zinc-950 p-3 rounded-lg overflow-x-auto">
{`CREATE TABLE IF NOT EXISTS request_logs (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  path TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  user_agent TEXT,
  status INT DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_ip ON request_logs(ip);
CREATE INDEX IF NOT EXISTS idx_request_logs_created ON request_logs(created_at);

ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;`}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS request_logs (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  path TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  user_agent TEXT,
  status INT DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_ip ON request_logs(ip);
CREATE INDEX IF NOT EXISTS idx_request_logs_created ON request_logs(created_at);

ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;`)
                    }}
                    className="mt-2 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Copiar SQL
                  </button>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  Una vez creada la tabla, el sistema registrará automáticamente
                  los errores 404 y detectará patrones de scraping (más de 100
                  requests/min desde una misma IP).
                </p>
              </div>
            </div>

            {/* Último contenido agregado */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-5">
              <h2 className="text-sm font-bold text-zinc-200 mb-3">Último contenido agregado</h2>
              <div className="flex flex-wrap gap-2">
                {stats.recentContent.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/editar?key=${adminKey}&id=${c.id}`}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full transition-colors truncate max-w-[200px]"
                  >
                    {c.titulo}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
