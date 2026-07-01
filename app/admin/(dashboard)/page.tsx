'use client'

import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
        <Link
          href="/admin/importar"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00bcd4]/20 hover:border-[#00bcd4] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">📥</div>
          <h2 className="text-lg font-semibold text-white mb-1">Importar post</h2>
          <p className="text-sm text-[#94a3b8]">
            Pegar texto de un post de Discord y subirlo directamente a la web
          </p>
        </Link>

        <Link
          href="/admin/reportes"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff9e64]/20 hover:border-[#ff9e64] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">📋</div>
          <h2 className="text-lg font-semibold text-white mb-1">Reportes</h2>
          <p className="text-sm text-[#94a3b8]">
            Gestionar reportes de links caídos enviados por usuarios
          </p>
        </Link>

        <Link
          href="/admin/faq"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00bcd4]/20 hover:border-[#00bcd4] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">❓</div>
          <h2 className="text-lg font-semibold text-white mb-1">FAQ</h2>
          <p className="text-sm text-[#94a3b8]">
            Agregar, editar o eliminar preguntas frecuentes de la web
          </p>
        </Link>

        <Link
          href="/admin/editar"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00bcd4]/20 hover:border-[#00bcd4] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">✏️</div>
          <h2 className="text-lg font-semibold text-white mb-1">Editar post</h2>
          <p className="text-sm text-[#94a3b8]">
            Modificar título, descripción, link o portada de un post existente
          </p>
        </Link>

        <Link
          href="/admin/revisar"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#f97316]/20 hover:border-[#f97316] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">🔍</div>
          <h2 className="text-lg font-semibold text-white mb-1">Revisar contenido</h2>
          <p className="text-sm text-[#94a3b8]">
            Detectar posts con portada rota, link faltante o campos vacíos y corregirlos
          </p>
        </Link>

        <Link
          href="/admin/eliminar"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff4d4d]/20 hover:border-[#ff4d4d] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">🗑️</div>
          <h2 className="text-lg font-semibold text-white mb-1">Eliminar post</h2>
          <p className="text-sm text-[#94a3b8]">
            Eliminar un post y su imagen de portada del almacenamiento
          </p>
        </Link>

        <Link
          href="/admin/peticiones"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00bcd4]/20 hover:border-[#00bcd4] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">📩</div>
          <h2 className="text-lg font-semibold text-white mb-1">Peticiones</h2>
          <p className="text-sm text-[#94a3b8]">
            Gestionar solicitudes de cómics de los usuarios
          </p>
        </Link>

        <Link
          href="/admin/monitoreo"
          className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#22d3ee]/20 hover:border-[#22d3ee] group"
        >
          <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">📊</div>
          <h2 className="text-lg font-semibold text-white mb-1">Monitoreo</h2>
          <p className="text-sm text-[#94a3b8]">
            Estadísticas en vivo, visitas, online, reportes y detección de amenazas
          </p>
        </Link>
      </div>
    </div>
  )
}
