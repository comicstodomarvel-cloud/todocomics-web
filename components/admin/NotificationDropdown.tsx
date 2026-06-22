'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Check, ExternalLink, Clock, AlertTriangle, Mail, Image as ImageIcon, ShieldAlert } from 'lucide-react'

interface Notificacion {
  id: string
  tipo: string
  titulo: string
  detalle: string | null
  link: string | null
  metadata: Record<string, unknown> | null
  leida: boolean
  fecha_creacion: string
}

const ICONOS: Record<string, React.ReactNode> = {
  reporte: <Mail size={14} className="text-red-400" />,
  peticion: <Mail size={14} className="text-blue-400" />,
  portada_rota: <ImageIcon size={14} className="text-orange-400" />,
  monitoreo: <ShieldAlert size={14} className="text-yellow-400" />,
}

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const dias = Math.floor(hrs / 24)
  return `hace ${dias}d`
}

interface NotificationDropdownProps {
  adminKey: string
  onClose: () => void
}

export default function NotificationDropdown({ adminKey, onClose }: NotificationDropdownProps) {
  const [items, setItems] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch('/api/admin/notificaciones?unread=true&limit=10', {
          headers: { 'x-admin-key': adminKey },
        })
        if (res.ok) {
          const data = await res.json()
          setItems(data.items ?? [])
        }
      } catch {
        // silencio
      } finally {
        setLoading(false)
      }
    }
    fetchNotifs()
  }, [adminKey])

  async function marcarLeida(id: string) {
    try {
      await fetch(`/api/admin/notificaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ leida: true }),
      })
      setItems((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // silencio
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-100">Notificaciones</h3>
        {items.length > 0 && (
          <span className="text-xs text-zinc-500">{items.length} sin leer</span>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-zinc-500">
            <Check size={24} className="mb-2 text-green-500" />
            <p className="text-sm">Todo en orden</p>
            <p className="text-xs mt-1">No hay notificaciones pendientes</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {items.map((notif) => (
              <div key={notif.id} className="px-4 py-3 hover:bg-zinc-800/50 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {ICONOS[notif.tipo] || <Bell size={14} className="text-zinc-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{notif.titulo}</p>
                    {notif.detalle && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{notif.detalle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                        <Clock size={10} />
                        {tiempoRelativo(notif.fecha_creacion)}
                      </span>
                      {notif.link && (
                        <a
                          href={notif.link}
                          onClick={onClose}
                          className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-0.5"
                        >
                          Atender <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => marcarLeida(notif.id)}
                    className="shrink-0 p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-all"
                    title="Marcar como leída"
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
