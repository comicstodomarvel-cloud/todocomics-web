"use client"

import { usePlayer } from "@/lib/playerStore"
import { Volume2, VolumeX } from "lucide-react"
import { useCallback } from "react"

export default function VolumeControl() {
  const { volume, setVolume } = usePlayer()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(e.target.value))
    },
    [setVolume]
  )

  const toggleMute = useCallback(() => {
    setVolume(volume > 0 ? 0 : 50)
  }, [volume, setVolume])

  return (
    <div className="flex items-center gap-2 px-4">
      <button
        onClick={toggleMute}
        className="text-zinc-400 hover:text-zinc-100 transition-colors flex-shrink-0"
        aria-label={volume > 0 ? "Silenciar" : "Activar sonido"}
      >
        {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleChange}
        className="flex-1 h-1 appearance-none bg-zinc-800 rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:bg-zinc-100 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:hover:bg-white
          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:bg-zinc-100 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
        aria-label="Volumen"
      />
    </div>
  )
}
