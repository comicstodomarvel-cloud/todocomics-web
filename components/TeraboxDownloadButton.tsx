"use client"

import { useState, useCallback } from "react"
import { Brain } from "lucide-react"
import TeraboxDownloadPanel from "./TeraboxDownloadPanel"

export default function TeraboxDownloadButton({ variant = "sidebar" }: { variant?: "sidebar" | "toolbar" }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <div className={variant === "toolbar" ? "relative group" : ""}>
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 font-bold transition-all duration-200 ${
          variant === "sidebar"
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-2.5 min-h-[44px] rounded-full shadow-lg hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
            : "w-10 h-10 rounded-full justify-center text-zinc-400 hover:text-[#ff8c00] hover:scale-110 hover:shadow-[0_0_10px_rgba(255,140,0,0.4)] hover:bg-zinc-800/50"
        }`}
        title="Cerebro"
      >
        <Brain size={18} />
        {variant === "sidebar" && <span className="text-sm">Cerebro</span>}
        {variant === "toolbar" && (
          <span className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center z-50 animate-fade-in bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
            Descargar de Terabox
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`fixed left-4 right-4 top-20 z-50 w-auto ${
            variant === "toolbar"
              ? "sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-96 max-w-[384px]"
              : "sm:absolute sm:left-full sm:top-0 sm:ml-2 sm:w-96 max-w-[384px]"
          }`}
        >
          <TeraboxDownloadPanel onClose={() => setIsOpen(false)} />
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
