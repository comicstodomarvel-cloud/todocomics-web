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
        <div className="flex-none flex flex-col gap-3 pt-4 pb-2 overflow-hidden">
          <NowPlayingInfo />
          <ProgressBar />
          <PlayerControls />
          <VolumeControl />
        </div>

        {/* Playlist */}
        <div className="flex-1 min-h-0 border-t border-zinc-800/50 pt-0">
          <PlaylistView />
        </div>
      </div>

      {/* Desktop FAB */}
      <button
        onClick={hasMusic ? toggleDesktopCollapsed : undefined}
        className={`fixed right-5 z-50
          hidden lg:flex items-center justify-center
          w-12 h-12 rounded-full
          bg-zinc-800 hover:bg-zinc-700
          shadow-[0_4px_20px_rgba(0,0,0,0.5)]
          transition-all duration-300 active:scale-90
          ${
            isDesktopCollapsed
              ? "top-1/2 -translate-y-1/2"
              : "translate-x-80 top-1/2 -translate-y-1/2 pointer-events-none"
          }
          ${isPlaying && hasMusic ? "ring-2 ring-amber-500/50 animate-music-pulse" : ""}
          ${!hasMusic ? "opacity-60" : ""}
        `}
        style={{
          transitionProperty: "transform, opacity",
        }}
        aria-label={isDesktopCollapsed ? "Abrir reproductor" : "Reproductor"}
        tabIndex={isDesktopCollapsed ? 0 : -1}
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

        {isPlaying && hasMusic && (
          <>
            <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-music-ring-1" />
            <span className="absolute inset-0 rounded-full bg-amber-500/10 animate-music-ring-2" />
          </>
        )}
      </button>
    </>
  )
}