"use client"

import { usePlayer } from "@/lib/playerStore"
import { Heart, Play } from "lucide-react"

export default function PlaylistView() {
  const {
    playlist,
    currentIndex,
    playTrack,
    toggleFavorite,
    favorites,
    activeTab,
    setActiveTab,
  } = usePlayer()

  const favoriteTracks = playlist.filter((t) => favorites.includes(t.videoId))
  const displayTracks = activeTab === "favorites" ? favoriteTracks : playlist
  const isEmpty = displayTracks.length === 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex border-b border-zinc-800 px-4">
        <button
          onClick={() => setActiveTab("playlist")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === "playlist"
              ? "text-amber-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Lista
          <span className="text-zinc-600 text-xs ml-1">({playlist.length})</span>
          {activeTab === "playlist" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === "favorites"
              ? "text-amber-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Favoritos
          <span className="text-zinc-600 text-xs ml-1">({favoriteTracks.length})</span>
          {activeTab === "favorites" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
            <Heart size={32} className="mb-3" />
            <p className="text-sm">
              {activeTab === "favorites"
                ? "No tienes favoritos aún"
                : "No hay canciones disponibles"}
            </p>
            {activeTab === "favorites" && (
              <p className="text-xs mt-1">
                Marca canciones con ♡ para guardarlas aquí
              </p>
            )}
          </div>
        ) : (
          <div className="py-1">
            {displayTracks.map((track) => {
              const realIndex = playlist.indexOf(track)
              const isActive = realIndex === currentIndex
              const isFav = favorites.includes(track.videoId)

              return (
                <button
                  key={track.videoId}
                  onClick={() => playTrack(realIndex)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${
                    isActive
                      ? "bg-zinc-800/60 text-amber-500"
                      : "text-zinc-300 hover:bg-zinc-800/30"
                  }`}
                >
                  <span className="flex-shrink-0 w-5 text-center">
                    {isActive ? (
                      <Play size={12} fill="currentColor" className="mx-auto" />
                    ) : (
                      <span className="text-xs text-zinc-600 group-hover:text-zinc-400">
                        {realIndex + 1}
                      </span>
                    )}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-sm truncate ${
                        isActive ? "font-medium" : ""
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="block text-xs text-zinc-600 truncate">
                      {track.artist}
                    </span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(track.videoId)
                    }}
                    className={`flex-shrink-0 p-1 transition-all ${
                      isFav
                        ? "text-red-400 opacity-100"
                        : "text-zinc-600 opacity-0 group-hover:opacity-100"
                    } hover:scale-110`}
                    aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                  >
                    <Heart size={12} fill={isFav ? "currentColor" : "none"} />
                  </button>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
