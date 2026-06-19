"use client"

import { usePlayer } from "@/lib/playerStore"

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function ProgressBar() {
  const { currentTime, duration, seekTo, currentIndex } = usePlayer()

  if (currentIndex < 0) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const time = percent * duration
    seekTo(time)
  }

  return (
    <div className="w-full px-4">
      <div
        className="relative h-1.5 bg-zinc-800 rounded-full cursor-pointer group"
        onClick={handleSeek}
      >
        <div
          className="absolute inset-y-0 left-0 bg-amber-500 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-zinc-500 text-xs tabular-nums">{formatTime(currentTime)}</span>
        <span className="text-zinc-500 text-xs tabular-nums">{formatTime(duration)}</span>
      </div>
    </div>
  )
}
