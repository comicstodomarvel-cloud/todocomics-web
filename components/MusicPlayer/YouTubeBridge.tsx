"use client"

import { useEffect, useRef } from "react"
import { usePlayer } from "@/lib/playerStore"

let apiLoaded = false

export default function YouTubeBridge() {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    setPlayerInstance,
    updateProgress,
    onTrackEnded,
    playlist,
    currentIndex,
  } = usePlayer()

  const progressInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (typeof window === "undefined") return

    function createPlayer() {
      if (!containerRef.current || playerRef.current) return
      const player = new YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: () => {
            playerRef.current = player
            player.setVolume(50)
            setPlayerInstance(player)
          },
          onStateChange: (e: YT.OnStateChangeEvent) => {
            if (e.data === YT.PlayerState.PLAYING) {
              const dur = player.getDuration()
              updateProgress(0, dur)
              progressInterval.current = setInterval(() => {
                try {
                  const time = player.getCurrentTime()
                  const duration = player.getDuration()
                  updateProgress(time, duration)
                } catch {}
              }, 500)
            } else {
              if (progressInterval.current) {
                clearInterval(progressInterval.current)
                progressInterval.current = undefined
              }
            }
            if (e.data === YT.PlayerState.ENDED) {
              onTrackEnded()
            }
          },
          onError: () => {},
        },
      })
    }

    if (!apiLoaded) {
      apiLoaded = true
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      tag.async = true
      document.body.appendChild(tag)
      ;(window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady = createPlayer
    } else if (typeof YT !== "undefined" && YT.Player) {
      createPlayer()
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [setPlayerInstance, updateProgress, onTrackEnded])

  useEffect(() => {
    if (!playerRef.current || currentIndex < 0 || !playlist[currentIndex]) return
    playerRef.current.loadVideoById(playlist[currentIndex].videoId)
  }, [currentIndex, playlist])

  return (
    <div
      ref={containerRef}
      id="youtube-player"
      className="fixed opacity-0 pointer-events-none"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      aria-hidden="true"
    />
  )
}
