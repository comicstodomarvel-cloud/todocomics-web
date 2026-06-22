'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Gift, X } from 'lucide-react'

const STORAGE_KEY = 'terabox_cta_shown'

export default function TeraboxNotification() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname.startsWith('/admin')) return
    const shown = sessionStorage.getItem(STORAGE_KEY)
    if (!shown) {
      setShow(true)
      sessionStorage.setItem(STORAGE_KEY, '1')
    }
  }, [pathname])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={() => setShow(false)}
    >
      <div
        className="relative w-full max-w-md bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-300 transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-full bg-[#ff8c00]/10 flex items-center justify-center mx-auto mb-4">
          <Gift size={26} className="text-[#ff8c00]" />
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-3">
          1TB GRATIS para guardar tus cómics
        </h3>

        <div className="text-sm text-zinc-400 leading-relaxed mb-6 space-y-3 text-center">
          <p>
            ¿Sabías que puedes guardar y descargar todo el material de{' '}
            <strong className="text-[#ff8c00]">TodoComics</strong> sin
            preocuparte por el espacio?
          </p>
          <p>
            Crea una cuenta gratis en{' '}
            <strong className="text-white">Terabox</strong> y obtén{' '}
            <strong className="text-[#ff8c00]">1TB de almacenamiento</strong> en
            la nube completamente GRATIS. Podrás almacenar todos tus cómics,
            películas, series y mangas favoritos para verlos cuando quieras,
            desde cualquier dispositivo.
          </p>
          <ul className="text-left space-y-1.5 max-w-xs mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-[#ff8c00]">✅</span>
              <span>1TB de espacio gratis</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#ff8c00]">✅</span>
              <span>Acceso desde cualquier dispositivo</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#ff8c00]">✅</span>
              <span>Guarda todo el contenido de la web</span>
            </li>
          </ul>
        </div>

        <a
          href="https://www.terabox.com/referral/4401765338615"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 text-sm font-bold text-black text-center transition-all duration-200 hover:from-amber-400 hover:to-orange-400 hover:scale-[1.02] active:scale-[0.98] mb-3"
        >
          CREAR CUENTA GRATIS →
        </a>

        <button
          onClick={() => setShow(false)}
          className="block w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors text-center"
        >
          AHORA NO
        </button>
      </div>
    </div>
  )
}
