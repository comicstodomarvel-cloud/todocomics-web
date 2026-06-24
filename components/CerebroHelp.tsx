"use client"

import { useState } from "react"
import { ChevronDown, Coffee } from "lucide-react"

export default function CerebroHelp() {
  const [faqOpen, setFaqOpen] = useState(true)

  return (
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
            Cerebro usa <strong className="text-[#ff8c00]">tokens de API</strong>{" "}
            para convertir enlaces de Terabox en descargas directas sin límite de
            velocidad. Estos tokens tienen un{" "}
            <strong className="text-[#ff8c00]">costo en USD</strong> y se agotan
            con cada uso.
          </p>
          <p>
            Si querés que la herramienta{" "}
            <strong className="text-[#ff8c00]">siga funcionando sin límites</strong>{" "}
            y los tokens no se agoten, podés colaborar con un aporte voluntario.
            Dependemos de tu ayuda para mantener esto activo indefinidamente.
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
  )
}
