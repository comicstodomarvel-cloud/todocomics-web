import type { Metadata } from 'next'
import Link from 'next/link'
import FaqSection from '@/components/FaqSection'

export const metadata: Metadata = {
  title: 'FAQ - Preguntas Frecuentes | TodoComics',
  description:
    'Respuestas a las preguntas más frecuentes sobre TodoComics: contraseñas, descargas, reportes y más.',
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Botón flotante de regreso (mobile) */}
      <Link
        href="/"
        className="fixed bottom-8 right-8 z-50 md:hidden bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h3a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Inicio</span>
      </Link>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Preguntas Frecuentes</h1>
            <p className="text-zinc-400">
              Respuestas a las dudas más comunes sobre TodoComics
            </p>
          </div>

          <Link
            href="/"
            className="hidden md:flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold px-6 py-3 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al Inicio</span>
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <FaqSection />
        </div>
      </div>

      <footer className="bg-zinc-900 text-zinc-400 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 TodoComics. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
