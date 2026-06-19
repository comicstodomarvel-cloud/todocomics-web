"use client"

import { usePlayer } from "@/lib/playerStore"
import NowPlayingInfo from "./NowPlayingInfo"
import ProgressBar from "./ProgressBar"
import PlayerControls from "./PlayerControls"
import VolumeControl from "./VolumeControl"
import PlaylistView from "./PlaylistView"
import { X } from "lucide-react"
import { useCallback, useEffect } from "react"

export default function MobileSheet() {
  const { isSheetOpen, closeSheet } = usePlayer()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet()
    },
    [closeSheet]
  )

  useEffect(() => {
    if (isSheetOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isSheetOpen, handleKeyDown])

  return (
    <>
      {/* Backdrop */}
      <button
        onClick={closeSheet}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          lg:hidden
          ${isSheetOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-label="Cerrar reproductor"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-2xl shadow-2xl
          lg:hidden flex flex-col
          transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
          max-h-[85vh] safe-bottom
          ${isSheetOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-zinc-500 text-xs font-medium">Reproductor</span>
          <button
            onClick={closeSheet}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors rounded-full hover:bg-zinc-800"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 px-2 pb-2 overflow-y-auto">
          <div className="pt-2">
            <NowPlayingInfo />
          </div>
          <ProgressBar />
          <PlayerControls />
          <VolumeControl />
        </div>

        {/* Playlist */}
        <div className="flex-1 min-h-0 border-t border-zinc-800 mt-1">
          <PlaylistView />
        </div>

        {/* Safe area spacing */}
        <div className="h-2 safe-bottom" />
      </div>
    </>
  )
}
