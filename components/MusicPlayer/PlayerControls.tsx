"use client"

import { usePlayer } from "@/lib/playerStore"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Shuffle,
} from "lucide-react"

export default function PlayerControls() {
  const {
    togglePlay,
    nextTrack,
    prevTrack,
    toggleFavorite,
    toggleShuffle,
    isPlaying,
    isShuffling,
    currentIndex,
    playlist,
    favorites,
  } = usePlayer()

  const track = currentIndex >= 0 ? playlist[currentIndex] : null
  const isFav = track ? favorites.includes(track.videoId) : false
  const hasTracks = playlist.length > 0

  return (
    <div className="flex items-center justify-center gap-4 px-4">
      <button
        onClick={toggleShuffle}
        disabled={!hasTracks}
        className={`transition-all p-1 disabled:text-zinc-700 disabled:cursor-not-allowed ${
          isShuffling ? "text-amber-500" : "text-zinc-400 hover:text-zinc-100"
        }`}
        aria-label={isShuffling ? "Desactivar aleatorio" : "Activar aleatorio"}
      >
        <Shuffle size={16} />
      </button>

      <button
        onClick={prevTrack}
        disabled={!hasTracks || currentIndex <= 0}
        className="text-zinc-400 hover:text-zinc-100 disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors p-1"
        aria-label="Anterior"
      >
        <SkipBack size={20} />
      </button>

      <button
        onClick={togglePlay}
        disabled={!hasTracks}
        className="bg-zinc-100 text-black hover:bg-zinc-300 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-full p-2.5 transition-all active:scale-95 disabled:active:scale-100"
        aria-label={isPlaying ? "Pausar" : "Reproducir"}
      >
        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
      </button>

      <button
        onClick={nextTrack}
        disabled={!hasTracks || (!isShuffling && currentIndex >= playlist.length - 1)}
        className="text-zinc-400 hover:text-zinc-100 disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors p-1"
        aria-label="Siguiente"
      >
        <SkipForward size={20} />
      </button>

      <button
        onClick={() => track && toggleFavorite(track.videoId)}
        disabled={!track}
        className={`transition-all p-1 disabled:text-zinc-700 disabled:cursor-not-allowed ${
          isFav ? "text-red-400 hover:text-red-300" : "text-zinc-400 hover:text-zinc-100"
        }`}
        aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <Heart size={18} fill={isFav ? "currentColor" : "none"} />
      </button>
    </div>
  )
}
