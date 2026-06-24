"use client"

import { useState, useEffect } from "react"
import { X, Download, Check, Loader, AlertTriangle, Brain, ChevronDown, Coffee } from "lucide-react"

const STORAGE_KEY = "tc-terabox-verified"

const LINK_PATTERNS = [
  { label: "Terabox share", regex: /^(https?:\/\/)?(www\.)?(1024terabox|terabox|freeterabox|teraboxapp|teraboxurl|teraboxshare)\.com\/(s\/|spanish\/sharing\/link\?surl=)/i },
  { label: "Bitly", regex: /^(https?:\/\/)?(www\.)?bit\.ly\//i },
]

function detectLinkType(url: string): { label: string; valid: boolean } | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  for (const pattern of LINK_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      return { label: pattern.label, valid: true }
    }
  }
  if (/^https?:\/\/.+/i.test(trimmed)) {
    return { label: "Link detectado", valid: true }
  }
  return null
}

interface DownloadResult {
  name: string
  size_formatted: string
  type: string
  fast_dlink: string
  thumbnail?: string
}

async function getOrRefreshToken(): Promise<string> {
  const res = await fetch("/api/terabox/verify", { method: "POST" })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Error del servidor (${res.status})`)
  }
  const data = await res.json()
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: data.token, timestamp: Date.now() })
  )
  return data.token
}

export default function TeraboxDownloadPanel({ onClose }: { onClose: () => void }) {
  const [link, setLink] = useState("")
  const [detectedType, setDetectedType] = useState<{ label: string; valid: boolean } | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [results, setResults] = useState<DownloadResult[] | null>(null)
  const [error, setError] = useState("")
  const [faqOpen, setFaqOpen] = useState(true)

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY)
    getOrRefreshToken().catch(() => {})
  }, [])

  function handleLinkChange(value: string) {
    setLink(value)
    setError("")
    setResults(null)
    if (value.trim()) {
      setDetectedType(detectLinkType(value))
    } else {
      setDetectedType(null)
    }
  }

  async function handleDownload() {
    if (!link.trim()) return
    setDownloading(true)
    setError("")
    setResults(null)

    try {
      const token = await getOrRefreshToken()

      const res = await fetch("/api/terabox/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim(), token }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al descargar")
        return
      }

      if (data.status === "success" && data.list?.length > 0) {
        setResults(data.list)
      } else {
        setError("No se encontraron archivos en ese enlace")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error de conexión")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={20} />
          <h3 className="font-bold text-lg">Cerebro</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-full transition-colors">
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
            placeholder="https://1024terabox.com/s/..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
          />
          {detectedType && (
            <div
              className={`mt-1.5 text-xs flex items-center gap-1 ${
                detectedType.valid ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {detectedType.valid ? <Check size={12} /> : <AlertTriangle size={12} />}
              {detectedType.label}
            </div>
          )}
        </div>

        {/* Donation info — FAQ style */}
        <div className="bg-[#121212] rounded-xl border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setFaqOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-zinc-800/30"
          >
            <span className="font-semibold text-zinc-100 text-sm">
              ⚡ ¿Cómo funciona Cerebro?
            </span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-300 ${
                faqOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-y-auto transition-all duration-300 ${
              faqOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 pb-4 text-zinc-400 text-xs sm:text-sm leading-relaxed space-y-2">
              <p>
                Cerebro usa <strong className="text-[#ff8c00]">tokens de API</strong> para
                convertir enlaces de Terabox en descargas directas sin límite de velocidad.
                Estos tokens tienen un <strong className="text-[#ff8c00]">costo en USD</strong>{" "}
                y se agotan con cada uso.
              </p>
              <p>
                Si querés que la herramienta{" "}
                <strong className="text-[#ff8c00]">siga funcionando sin límites</strong> y los
                tokens no se agoten, podés colaborar con un aporte voluntario. Dependemos de tu
                ayuda para mantener esto activo indefinidamente.
              </p>
              <a
                href="https://ko-fi.com/todocomics"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#ff8c00] hover:bg-[#e67e00] text-black font-bold px-4 py-2.5 rounded-lg text-sm transition-all hover:scale-105"
              >
                <Coffee size={16} />
                Donar en Ko-Fi
              </a>
            </div>
          </div>
        </div>

        {/* Download */}
        {detectedType?.valid && (
          <button
            onClick={handleDownload}
            disabled={downloading || !link.trim()}
            className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-lg text-sm transition-all ${
              downloading
                ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black hover:scale-[1.02] active:scale-95"
            }`}
          >
            {downloading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            DESCARGAR SIN LÍMITE DE VELOCIDAD
          </button>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Archivos encontrados
            </h4>
            {results.map((file, i) => (
              <div
                key={i}
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 flex items-center gap-3"
              >
                {file.thumbnail && (
                  <img
                    src={file.thumbnail}
                    alt="thumbnail"
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-700"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-100 font-medium truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500">{file.size_formatted}</p>
                </div>
                <a
                  href={file.fast_dlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shrink-0"
                >
                  <Download size={14} />
                  Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
