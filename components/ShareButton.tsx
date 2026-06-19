'use client'

import { Share2 } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  titulo: string
  url: string
}

export default function ShareButton({ titulo, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: titulo, url })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
      aria-label="Compartir"
    >
      <Share2 size={18} />
      {copied ? '¡Enlace copiado!' : 'Compartir'}
    </button>
  )
}
