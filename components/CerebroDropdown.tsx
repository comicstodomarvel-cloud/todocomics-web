"use client"

import { useState } from "react"
import { X, Download, Loader, AlertTriangle, Brain, Zap, File } from "lucide-react"
import CerebroHelp from "./CerebroHelp"

interface FileResult {
  name: string
  size_formatted: string
  type: string
  fast_dlink: string
  thumbnail?: string
}

export default function CerebroDropdown({
  onClose,
}: {
  onClose: () => void
}) {
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<FileResult[] | null>(null)

  function handleLinkChange(value: string) {
    setLink(value)
    setError("")
    setResult(null)
  }

  async function handleDownload() {
    const trimmed = link.trim()
    if (!trimmed) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/fetch-terabox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al procesar el enlace")
        return
      }

      if (data.status === "success" && data.list?.length > 0) {
        setResult(data.list)
      } else {
        setError("No se encontraron archivos en ese enlace")
      }
    } catch {
      setError("Error de conexión. Verificá el enlace e intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const hero = result?.[0]
  const rest = result?.slice(1) ?? []

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={20} />
          <h3 className="font-bold text-lg">Cerebro</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/20 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[70dvh] overflow-y-auto p-4 space-y-4">
        {/* Input */}
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1 block">
            Pegá el link de Terabox
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => handleLinkChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleDownload()
            }}
            placeholder="https://terabox.com/s/..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={loading || !link.trim()}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-lg text-sm transition-all ${
            loading
              ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black hover:scale-[1.02] active:scale-95"
          }`}
        >
          {loading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Zap size={18} />
          )}
          {loading ? "Procesando..." : "Descargar Directo"}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Hero file (first result) */}
        {hero && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
            {hero.thumbnail && (
              <img
                src={hero.thumbnail}
                alt=""
                className="w-full h-32 object-cover rounded-lg bg-zinc-700"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm text-zinc-100 font-medium truncate">
                {hero.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {hero.size_formatted}
              </p>
            </div>
            <a
              href={hero.fast_dlink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors w-full"
            >
              <Download size={16} />
              Descargar Directo
            </a>
          </div>
        )}

        {/* Rest of files (compact list) */}
        {rest.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Otros archivos ({rest.length})
            </h4>
            <div className="space-y-1.5">
              {rest.map((file, i) => (
                <div
                  key={i}
                  className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-2.5 flex items-center gap-3"
                >
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                      <File size={16} className="text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-100 font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {file.size_formatted}
                    </p>
                  </div>
                  <a
                    href={file.fast_dlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    <Download size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <CerebroHelp />
      </div>
    </div>
  )
}
