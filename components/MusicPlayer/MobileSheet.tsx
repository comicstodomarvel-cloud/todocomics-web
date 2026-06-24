"use client"

import { usePlayer } from "@/lib/playerStore"
import NowPlayingInfo from "./NowPlayingInfo"
import ProgressBar from "./ProgressBar"
import PlayerControls from "./PlayerControls"
import VolumeControl from "./VolumeControl"
import PlaylistView from "./PlaylistView"
import { X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const DRAG_THRESHOLD = 120

export default function MobileSheet() {
  const { isSheetOpen, closeSheet } = usePlayer()
  const [dragOffset, setDragOffset] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const dragStartY = useRef(0)
  const isDragging = useRef(false)

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    isDragging.current = true
    dragStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta < 0) return
    setDragOffset(delta * 0.6)
  }, [])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false

    if (dragOffset > DRAG_THRESHOLD && isSheetOpen) {
      setIsClosing(true)
      setDragOffset(window.innerHeight)
      setTimeout(() => {
        closeSheet()
        setDragOffset(0)
        setIsClosing(false)
      }, 400)
    } else {
      setDragOffset(0)
    }
  }, [dragOffset, isSheetOpen, closeSheet])

  const show = isSheetOpen || isClosing
  const backdropOpacity = isSheetOpen
    ? Math.max(0, 1 - dragOffset / 500)
    : 0

  let transform: string | undefined
  if (isClosing || dragOffset > 0) {
    transform = `translateY(${dragOffset}px)`
  } else if (isSheetOpen) {
    transform = "translateY(0px)"
  }

  return (
    <>
      {/* Backdrop */}
      <button
        onClick={closeSheet}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          lg:hidden
          ${show ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        style={dragOffset > 0 && isSheetOpen ? { opacity: backdropOpacity } : undefined}
        aria-label="Cerrar reproductor"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-2xl shadow-2xl
          lg:hidden flex flex-col
          transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
          max-h-[85dvh] overflow-hidden safe-bottom
          ${show ? "" : "translate-y-full"}
        `}
        style={transform ? { transform } : undefined}
      >
        {/* Drag handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none"
        >
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
        <div className="flex-none flex flex-col gap-3 px-2 pb-2">
          <div className="pt-1">
            <NowPlayingInfo />
          </div>
          <ProgressBar />
          <PlayerControls />
          <VolumeControl />
        </div>

        {/* Playlist */}
        <div className="flex-1 min-h-0 border-t border-zinc-800 mt-1 flex flex-col">
          <PlaylistView />
        </div>

        {/* Safe area spacing */}
        <div className="h-2 safe-bottom" />
      </div>
    </>
  )
}
