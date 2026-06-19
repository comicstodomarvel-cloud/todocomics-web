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
          hidden lg:flex items-center
          bg-zinc-800/95 backdrop-blur-xl border border-zinc-700/50
          shadow-[0_4px_20px_rgba(0,0,0,0.6)]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          active:scale-95
          ${
            isDesktopCollapsed
              ? "top-1/2 -translate-y-1/2"
              : "translate-x-80 top-1/2 -translate-y-1/2 pointer-events-none"
          }
          ${track
            ? "h-14 rounded-full pl-1 pr-3.5 gap-2.5"
            : "w-14 h-14 rounded-full justify-center"
          }
          ${!hasMusic ? "opacity-60" : ""}
        `}
        aria-label={isDesktopCollapsed ? "Abrir reproductor" : "Reproductor"}
        tabIndex={isDesktopCollapsed ? 0 : -1}
      >
        {track ? (
          <>
            <img
              src={track.thumbnail}
              alt={track.title}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0 max-w-[160px]">
              <p className="text-zinc-100 text-sm font-medium truncate leading-tight">
                {track.title}
              </p>
              <p className="text-zinc-400 text-xs truncate leading-tight">
                {track.artist}
              </p>
            </div>
            {isPlaying && (
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            )}
          </>
        ) : (
          <Music size={22} className="text-zinc-100" />
        )}
      </button>
    </>
  )
}