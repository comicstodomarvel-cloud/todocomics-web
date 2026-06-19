'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'

export default function ConfirmedBanner() {
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      setVisible(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('confirmed')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  if (!visible) return null

  return (
    <div className="fixed top-4 left-1/2 z-[60] w-full max-w-md -translate-x-1/2 px-4 animate-in slide-in-from-top">
      <div className="flex items-center gap-3 rounded-lg border border-emerald-600/30 bg-emerald-900/80 px-4 py-3 shadow-lg backdrop-blur-sm">
        <CheckCircle size={20} className="shrink-0 text-emerald-400" />
        <p className="flex-1 text-sm text-emerald-100">
          ¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión.
        </p>
        <button onClick={() => setVisible(false)} className="shrink-0 text-emerald-300 hover:text-emerald-100">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
