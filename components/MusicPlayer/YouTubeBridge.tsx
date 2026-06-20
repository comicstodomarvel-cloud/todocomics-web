"use client"

import { useEffect, useRef } from "react"
import { usePlayer } from "@/lib/playerStore"

let apiLoaded = false

export default function YouTubeBridge() {
  const playerRef = useRef<YT.Player | null>(null)
  const mountedRef = useRef(true)
  const {
    setPlayerInstance,
    updateProgress,
    onTrackEnded,
    setError,
    playlist,
    currentIndex,
  } = usePlayer()

  const progressInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    mountedRef.current = true
    if (typeof window === "undefined") return

    const container = document.createElement("div")
    container.id = "youtube-player"
    container.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none"
    container.setAttribute("aria-hidden", "true")
    document.body.appendChild(container)

    let playerCreated = false

    function createPlayer() {
      if (!mountedRef.current || playerRef.current) return
      try {
        const player = new YT.Player(container, {
          height: "0",
          width: "0",
          host: "https://www.youtube-nocookie.com",
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
              if (!mountedRef.current) return
              playerCreated = true
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              playerRef.current = player
              player.setVolume(50)
              setPlayerInstance(player)
              setError(null)
            },
            onStateChange: (e: YT.OnStateChangeEvent) => {
              if (!mountedRef.current) return
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
            onError: (e: YT.OnErrorEvent) => {
              const codes: Record<number, string> = {
                2: "Parámetro inválido en la solicitud del video",
                5: "Error del reproductor HTML5 — el video puede estar bloqueado",
                100: "Video no encontrado o fue eliminado",
                101: "La reproducción de este video no está permitida en embeds",
                150: "La reproducción de este video no está permitida en embeds",
              }
              const msg = codes[e.data] || `Error desconocido (código ${e.data})`
              console.error("[YouTubeBridge] Error del reproductor:", msg)
              setError(msg)
            },
          },
        })
      } catch (err) {
        console.error("[YouTubeBridge] Error al crear el reproductor:", err)
        setError("No se pudo iniciar el reproductor de YouTube")
      }
    }

    if (!apiLoaded) {
      apiLoaded = true
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      tag.async = true
      document.body.appendChild(tag)
      ;(window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady = createPlayer

      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current || playerCreated) return
        console.error("[YouTubeBridge] Timeout: la API de YouTube no cargó")
        setError("El reproductor de YouTube no pudo cargarse. Revisa tu bloqueador de anuncios.")
      }, 10000)
    } else if (typeof YT !== "undefined" && YT.Player) {
      createPlayer()
    }

    return () => {
      mountedRef.current = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
        progressInterval.current = undefined
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  }, [setPlayerInstance, updateProgress, onTrackEnded, setError])

  return null
}
