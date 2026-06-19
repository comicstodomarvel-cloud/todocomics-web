"use client"

import { usePlayer } from "@/lib/playerStore"

export default function NowPlayingInfo({ compact = false }: { compact?: boolean }) {
  const { playlist, currentIndex } = usePlayer()
  const track = currentIndex >= 0 ? playlist[currentIndex] : null

  if (!track) {
    return (
      <div className={`flex items-center gap-3 ${compact ? "" : "flex-col"}`}>
        {!compact && (
          <div className="w-full aspect-square rounded-lg bg-zinc-800 flex items-center justify-center">
            <span className="text-4xl">🎵</span>
          </div>
        )}
        <div className={compact ? "flex-1 min-w-0" : "text-center w-full"}>
          <p className="text-zinc-400 text-sm">Ninguna canción seleccionada</p>
          <p className="text-zinc-600 text-xs">Elige un tema de la lista</p>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-9 h-9 rounded object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-zinc-100 text-sm font-medium truncate">{track.title}</p>
          <p className="text-zinc-500 text-xs truncate">{track.artist}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 px-4">
      <div className="w-full aspect-square max-w-[280px] rounded-lg overflow-hidden bg-zinc-800 shadow-lg">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-center w-full">
        <h3 className="text-zinc-100 font-semibold text-base truncate">{track.title}</h3>
        <p className="text-zinc-500 text-sm truncate">{track.artist}</p>
      </div>
    </div>
  )
}
