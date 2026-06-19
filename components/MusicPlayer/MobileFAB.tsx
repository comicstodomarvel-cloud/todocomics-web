"use client"

import { usePlayer } from "@/lib/playerStore"
import { Music } from "lucide-react"

export default function MobileFAB() {
  const { toggleSheet, isPlaying, playlist, currentIndex } = usePlayer()

  const track = currentIndex >= 0 ? playlist[currentIndex] : null
  const hasMusic = playlist.length > 0

  return (
    <button
      onClick={toggleSheet}
      className={`fixed bottom-6 right-5 z-50
        lg:hidden flex items-center justify-center
        w-12 h-12 rounded-full
        bg-zinc-800 hover:bg-zinc-700
        shadow-[0_4px_20px_rgba(0,0,0,0.5)]
        transition-all duration-300 active:scale-90
        ${isPlaying && hasMusic ? "ring-2 ring-amber-500/50 animate-music-pulse" : ""}
      `}
      aria-label="Abrir reproductor"
    >
      {isPlaying && hasMusic && track ? (
        <img
          src={track.thumbnail}
          alt=""
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <Music size={20} className="text-zinc-100" />
      )}

      {/* Pulse rings */}
      {isPlaying && hasMusic && (
        <>
          <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-music-ring-1" />
          <span className="absolute inset-0 rounded-full bg-amber-500/10 animate-music-ring-2" />
        </>
      )}
    </button>
  )
}
