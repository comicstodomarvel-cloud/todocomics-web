"use client"

import { usePlayer } from "@/lib/playerStore"
import NowPlayingInfo from "./NowPlayingInfo"
import ProgressBar from "./ProgressBar"
import PlayerControls from "./PlayerControls"
import VolumeControl from "./VolumeControl"
import PlaylistView from "./PlaylistView"
import { ChevronRight, Music } from "lucide-react"

export default function DesktopPanel() {
  const {
    isDesktopCollapsed,
    toggleDesktopCollapsed,
    isPlaying,
    togglePlay,
    playlist,
    currentIndex,
  } = usePlayer()

  const track = currentIndex >= 0 ? playlist[currentIndex] : null
  const hasMusic = playlist.length > 0

  return (
    <>
      {/* Full panel */}
      <div
        className={`fixed top-0 right-0 w-80 h-screen bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 z-50
          transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]
          hidden lg:flex flex-col
          ${isDesktopCollapsed ? "translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <button
            onClick={toggleDesktopCollapsed}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
          >
            <ChevronRight size={16} />
            <span className="text-xs">Colapsar</span>
          </button>
          <span className="text-zinc-500 text-xs font-medium flex items-center gap-1.5">
            <Music size={12} />
            {hasMusic ? `${playlist.length} temas` : "Reproductor"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-4 pt-5 overflow-hidden">
          <NowPlayingInfo />
          <ProgressBar />
          <PlayerControls />
          <VolumeControl />
        </div>

        {/* Playlist */}
        <div className="flex-1 min-h-0 border-t border-zinc-800/50 mt-2 pt-0">
          <PlaylistView />
        </div>
      </div>

      {/* Mini collapsed card */}
      <button
        onClick={hasMusic ? toggleDesktopCollapsed : undefined}
        className={`fixed right-0 z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl
          transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]
          hidden lg:flex items-center gap-3 px-3 py-2.5 cursor-pointer
          ${
            isDesktopCollapsed
              ? "translate-x-0 top-1/2 -translate-y-1/2 w-56 rounded-l-xl"
              : "translate-x-[calc(100%+120px)] top-1/2 -translate-y-1/2 w-56 rounded-l-xl pointer-events-none"
          }
          ${!hasMusic ? "opacity-60" : ""}
          hover:translate-x-1 group
        `}
        style={{
          transitionProperty: "transform, opacity",
        }}
        aria-label={isDesktopCollapsed ? "Expandir reproductor" : "Reproductor"}
        tabIndex={isDesktopCollapsed ? 0 : -1}
      >
        {track ? (
          <>
            <img
              src={track.thumbnail}
              alt={track.title}
              className="w-9 h-9 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-zinc-100 text-sm font-medium truncate leading-tight">
                {track.title}
              </p>
              <p className="text-zinc-500 text-xs truncate leading-tight">
                {track.artist}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <span className="w-3 h-3 bg-zinc-100 rounded-sm" />
              ) : (
                <span className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-zinc-100 ml-0.5" />
              )}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <Music size={16} className="text-zinc-500" />
            </div>
            <div className="text-left">
              <p className="text-zinc-400 text-sm font-medium">TodoComics Music</p>
              <p className="text-zinc-600 text-xs">
                {hasMusic ? `${playlist.length} temas` : "Sin playlist"}
              </p>
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute inset-y-0 left-0 w-1 bg-amber-500/0 group-hover:bg-amber-500/50 rounded-l-xl transition-all" />
      </button>
    </>
  )
}
