"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Download, ExternalLink, Check, Loader, AlertTriangle, Brain } from "lucide-react"

const TERABOX_REFERRAL = "https://www.terabox.com/referral/4401765338615"
const STORAGE_KEY = "tc-terabox-verified"
const VERIFY_DELAY = 15000

const LINK_PATTERNS = [
  { label: "Terabox share", regex: /^(https?:\/\/)?(www\.)?(1024terabox|terabox)\.com\/s\//i },
  { label: "Terabox share alt", regex: /^(https?:\/\/)?(www\.)?teraboxshare\.com\//i },
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
  if (/^(https?:\/\/)?(.+)$/i.test(trimmed)) {
    return { label: "Link no soportado", valid: false }
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

export default function TeraboxDownloadPanel({ onClose }: { onClose: () => void }) {
  const [link, setLink] = useState("")
  const [detectedType, setDetectedType] = useState<{ label: string; valid: boolean } | null>(null)
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(VERIFY_DELAY / 1000)
  const [teraboxOpened, setTeraboxOpened] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [results, setResults] = useState<DownloadResult[] | null>(null)
  const [error, setError] = useState("")
  const teraboxRef = useRef<Window | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.token && Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
          setVerified(true)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
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

  function handleOpenTerabox() {
    teraboxRef.current = window.open(TERABOX_REFERRAL, "_blank", "noopener,noreferrer")
    if (teraboxRef.current) {
      setTeraboxOpened(true)
    }

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleConfirmLogin() {
    setVerifying(true)
    try {
      const res = await fetch("/api/terabox/verify", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al verificar")
        return
      }
      const data = await res.json()
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: data.token, timestamp: Date.now() })
      )
      setVerified(true)
    } catch {
      setError("Error de conexión al verificar")
    } finally {
      setVerifying(false)
    }
  }

  async function handleDownload() {
    if (!link.trim() || !verified) return
    setDownloading(true)
    setError("")
    setResults(null)

    const stored = localStorage.getItem(STORAGE_KEY)
    let token = ""
    if (stored) {
      try { token = JSON.parse(stored).token } catch {}
    }

    try {
      const res = await fetch("/api/terabox/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim(), token }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al descargar")
        if (res.status === 401) {
          localStorage.removeItem(STORAGE_KEY)
          setVerified(false)
        }
        return
      }

      if (data.status === "success" && data.list?.length > 0) {
        setResults(data.list)
      } else {
        setError("No se encontraron archivos en ese enlace")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setDownloading(false)
    }
  }

  const canConfirm = teraboxOpened && countdown === 0 && !verifying

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

        {detectedType?.valid && !verified && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-100">
              Necesitás una cuenta de Terabox
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Para poder iniciar la descarga sin límites de velocidad, primero debés{" "}
              <strong className="text-zinc-200">iniciar sesión</strong> en tu cuenta de
              Terabox o <strong className="text-zinc-200">registrarte</strong> si aún no
              tenés una. Es gratis y rápido.
            </p>
            {!teraboxOpened ? (
              <button
                onClick={handleOpenTerabox}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-lg text-sm transition-colors"
              >
                <ExternalLink size={16} />
                Registrarse / Iniciar Sesión en Terabox
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Check size={14} className="text-emerald-400" />
                  Pestaña de Terabox abierta
                </div>
                {countdown > 0 ? (
                  <div className="text-xs text-zinc-500 text-center">
                    Podés confirmar en{" "}
                    <span className="text-amber-400 font-bold">{countdown}s</span>
                  </div>
                ) : null}
                <button
                  onClick={handleConfirmLogin}
                  disabled={!canConfirm}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-lg text-sm transition-colors ${
                    canConfirm
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {verifying ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Ya inicié sesión / Ya me registré
                </button>
              </div>
            )}
          </div>
        )}

        {detectedType?.valid && verified && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Check size={14} />
              Cuenta verificada — descarga disponible
            </div>
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
          </div>
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
                    alt=""
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
