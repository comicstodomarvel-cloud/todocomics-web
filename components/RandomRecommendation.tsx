'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ContentItem {
  id: string
  titulo: string
  descripcion: string
  url_portada: string
  categoria: string
  link_descarga: string
}

const PASSWORD = 'marveltodocomics'

export default function RandomRecommendation() {
  const [recommendation, setRecommendation] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PASSWORD)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* silencio */
    }
  }, [])

  async function fetchRandomContent() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contenido')
        .select('*')
        .not('url_portada', 'is', null)
        .limit(100)

      if (error) {
        console.error('Error fetching content:', error)
        return
      }

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length)
        setRecommendation(data[randomIndex])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomContent()
  }, [])

  if (loading || !recommendation) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-zinc-800 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-zinc-100">
          🎲 Recomendación del Día
        </h2>
        <button
          onClick={fetchRandomContent}
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2.5 min-h-[44px] rounded-full transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Otra
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-32 h-48 sm:h-48 flex-shrink-0">
          <Image
            src={recommendation.url_portada}
            alt={recommendation.titulo}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-2">
            {recommendation.titulo}
          </h3>
          <p className="text-zinc-300 text-sm mb-3 line-clamp-3">
            {recommendation.descripcion}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-zinc-400 font-medium">
              CONTRASE&Ntilde;A:
            </span>
            <code className="bg-black/40 text-amber-400 text-xs font-mono px-2.5 py-1 rounded-md select-all">
              {PASSWORD}
            </code>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              aria-label="Copiar contraseña"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  &iexcl;Copiado!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copiar
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
              {recommendation.categoria}
            </span>
            <Link
              href={`/item/${recommendation.id}`}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2.5 min-h-[44px] flex items-center rounded-lg transition-colors text-sm"
            >
              Ver Detalles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
