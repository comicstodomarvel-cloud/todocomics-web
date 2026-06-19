"use client"

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Track } from "./musicData"

interface PlayerState {
  playlist: Track[]
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isPanelOpen: boolean
  isDesktopCollapsed: boolean
  isSheetOpen: boolean
  activeTab: "playlist" | "favorites"
  favorites: string[]
  isShuffling: boolean
  isLoading: boolean
  error: string | null
}

type PlayerAction =
  | { type: "SET_PLAYLIST"; payload: Track[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "PLAY_TRACK"; payload: number }
  | { type: "TOGGLE_PLAY" }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "NEXT_TRACK" }
  | { type: "PREV_TRACK" }
  | { type: "UPDATE_PROGRESS"; payload: { currentTime: number; duration: number } }
  | { type: "TRACK_ENDED" }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "TOGGLE_PANEL" }
  | { type: "TOGGLE_DESKTOP_COLLAPSED" }
  | { type: "SET_DESKTOP_COLLAPSED"; payload: boolean }
  | { type: "TOGGLE_SHEET" }
  | { type: "CLOSE_SHEET" }
  | { type: "SET_ACTIVE_TAB"; payload: "playlist" | "favorites" }
  | { type: "TOGGLE_FAVORITE"; payload: string }
  | { type: "LOAD_FAVORITES"; payload: string[] }
  | { type: "TOGGLE_SHUFFLE" }

const STORAGE_KEYS = {
  favorites: "tc-music-favorites",
  volume: "tc-music-volume",
  panelOpen: "tc-music-panel-open",
} as const

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const initialState: PlayerState = {
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: loadFromStorage(STORAGE_KEYS.volume, 50),
  isPanelOpen: loadFromStorage(STORAGE_KEYS.panelOpen, true),
  isDesktopCollapsed: false,
  isSheetOpen: false,
  activeTab: "playlist",
  favorites: loadFromStorage(STORAGE_KEYS.favorites, []),
  isShuffling: false,
  isLoading: true,
  error: null,
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_PLAYLIST":
      return { ...state, playlist: action.payload, isLoading: false }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "PLAY_TRACK":
      return {
        ...state,
        currentIndex: action.payload,
        isPlaying: true,
        currentTime: 0,
        isSheetOpen: false,
  isDesktopCollapsed: true,
      }
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying }
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload }
    case "NEXT_TRACK": {
      if (state.isShuffling && state.playlist.length > 1) {
        let randomIndex: number
        do {
          randomIndex = Math.floor(Math.random() * state.playlist.length)
        } while (randomIndex === state.currentIndex)
        return { ...state, currentIndex: randomIndex, isPlaying: true, currentTime: 0 }
      }
      const next = state.currentIndex + 1
      if (next >= state.playlist.length) {
        return { ...state, isPlaying: false, currentTime: 0 }
      }
      return { ...state, currentIndex: next, isPlaying: true, currentTime: 0 }
    }
    case "PREV_TRACK": {
      const prev = state.currentIndex - 1
      if (prev < 0) {
        return { ...state, currentTime: 0 }
      }
      return { ...state, currentIndex: prev, isPlaying: true, currentTime: 0 }
    }
    case "UPDATE_PROGRESS":
      return { ...state, currentTime: action.payload.currentTime, duration: action.payload.duration }
    case "TRACK_ENDED": {
      if (state.isShuffling && state.playlist.length > 1) {
        let randomIndex: number
        do {
          randomIndex = Math.floor(Math.random() * state.playlist.length)
        } while (randomIndex === state.currentIndex)
        return { ...state, currentIndex: randomIndex, currentTime: 0 }
      }
      const next = state.currentIndex + 1
      if (next >= state.playlist.length) {
        return { ...state, isPlaying: false, currentTime: 0 }
      }
      return { ...state, currentIndex: next, currentTime: 0 }
    }
    case "SET_VOLUME":
      return { ...state, volume: action.payload }
    case "TOGGLE_PANEL":
      return { ...state, isPanelOpen: !state.isPanelOpen }
    case "TOGGLE_SHUFFLE":
      return { ...state, isShuffling: !state.isShuffling }
    case "TOGGLE_DESKTOP_COLLAPSED":
      return { ...state, isDesktopCollapsed: !state.isDesktopCollapsed }
    case "SET_DESKTOP_COLLAPSED":
      return { ...state, isDesktopCollapsed: action.payload }
    case "TOGGLE_SHEET":
      return { ...state, isSheetOpen: !state.isSheetOpen }
    case "CLOSE_SHEET":
      return { ...state, isSheetOpen: false }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload }
    case "TOGGLE_FAVORITE": {
      const id = action.payload
      const exists = state.favorites.includes(id)
      const updated = exists ? state.favorites.filter((f) => f !== id) : [...state.favorites, id]
      return { ...state, favorites: updated }
    }
    case "LOAD_FAVORITES":
      return { ...state, favorites: action.payload }
    default:
      return state
  }
}

export interface PlayerContextValue extends PlayerState {
  playTrack: (index: number) => void
  togglePlay: () => void
  nextTrack: () => void
  prevTrack: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
  togglePanel: () => void
  toggleDesktopCollapsed: () => void
  setDesktopCollapsed: (collapsed: boolean) => void
  toggleSheet: () => void
  closeSheet: () => void
  setActiveTab: (tab: "playlist" | "favorites") => void
  toggleFavorite: (videoId: string) => void
  toggleShuffle: () => void
  setPlayerInstance: (player: YT.Player) => void
  updateProgress: (time: number, duration: number) => void
  onTrackEnded: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({
  children,
  playlist,
}: {
  children: ReactNode
  playlist: Track[]
}) {
  const [state, dispatch] = useReducer(playerReducer, {
    ...initialState,
    playlist,
    favorites: loadFromStorage(STORAGE_KEYS.favorites, []),
    volume: loadFromStorage(STORAGE_KEYS.volume, 50),
    isPanelOpen: loadFromStorage(STORAGE_KEYS.panelOpen, true),
  })

  const playerRef = useRef<YT.Player | null>(null)
  const isPanelOpenRef = useRef(state.isPanelOpen)

  useEffect(() => {
    isPanelOpenRef.current = state.isPanelOpen
  }, [state.isPanelOpen])

  const dispatchAndPersist = useCallback((action: PlayerAction) => {
    dispatch(action)
    if (action.type === "SET_VOLUME") {
      saveToStorage(STORAGE_KEYS.volume, action.payload)
    }
    if (action.type === "TOGGLE_PANEL") {
      saveToStorage(STORAGE_KEYS.panelOpen, !isPanelOpenRef.current)
    }
  }, [])

  const setPlayerInstance = useCallback((player: YT.Player) => {
    playerRef.current = player
  }, [])

  const setDesktopCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: "SET_DESKTOP_COLLAPSED", payload: collapsed })
  }, [])

  const playTrack = useCallback(
    (index: number) => {
      dispatchAndPersist({ type: "PLAY_TRACK", payload: index })
    },
    [dispatchAndPersist]
  )

  const togglePlay = useCallback(() => {
    if (state.currentIndex < 0 && state.playlist.length > 0) {
      dispatchAndPersist({ type: "PLAY_TRACK", payload: 0 })
      return
    }
    if (state.isPlaying) {
      playerRef.current?.pauseVideo()
    } else {
      playerRef.current?.playVideo()
    }
    dispatchAndPersist({ type: "TOGGLE_PLAY" })
  }, [state.currentIndex, state.isPlaying, state.playlist.length, dispatchAndPersist])

  const nextTrack = useCallback(() => {
    dispatchAndPersist({ type: "NEXT_TRACK" })
  }, [dispatchAndPersist])

  const prevTrack = useCallback(() => {
    dispatchAndPersist({ type: "PREV_TRACK" })
  }, [dispatchAndPersist])

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true)
  }, [])

  const setVolume = useCallback(
    (volume: number) => {
      playerRef.current?.setVolume(volume)
      dispatchAndPersist({ type: "SET_VOLUME", payload: volume })
    },
    [dispatchAndPersist]
  )

  const togglePanel = useCallback(() => {
    dispatchAndPersist({ type: "TOGGLE_PANEL" })
  }, [dispatchAndPersist])

  const toggleDesktopCollapsed = useCallback(() => {
    dispatch({ type: "TOGGLE_DESKTOP_COLLAPSED" })
  }, [])

  const toggleShuffle = useCallback(() => {
    dispatch({ type: "TOGGLE_SHUFFLE" })
  }, [])

  const toggleSheet = useCallback(() => {
    dispatch({ type: "TOGGLE_SHEET" })
  }, [])

  const closeSheet = useCallback(() => {
    dispatch({ type: "CLOSE_SHEET" })
  }, [])

  const setActiveTab = useCallback((tab: "playlist" | "favorites") => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab })
  }, [])

  const toggleFavorite = useCallback(
    (videoId: string) => {
      dispatchAndPersist({ type: "TOGGLE_FAVORITE", payload: videoId })
    },
    [dispatchAndPersist]
  )

  const updateProgress = useCallback((currentTime: number, duration: number) => {
    dispatch({ type: "UPDATE_PROGRESS", payload: { currentTime, duration } })
  }, [])

  const onTrackEnded = useCallback(() => {
    dispatch({ type: "TRACK_ENDED" })
  }, [])

  useEffect(() => {
    if (state.playlist.length > 0 && state.currentIndex >= 0) {
      const track = state.playlist[state.currentIndex]
      if (playerRef.current) {
        playerRef.current.loadVideoById(track.videoId)
      }
    }
  }, [state.currentIndex, state.playlist])

  useEffect(() => {
    if (playerRef.current && state.currentIndex >= 0) {
      if (state.isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    }
  }, [state.isPlaying, state.currentIndex])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.favorites, state.favorites)
  }, [state.favorites])

  const value: PlayerContextValue = {
    ...state,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    togglePanel,
    toggleDesktopCollapsed,
    setDesktopCollapsed,
    toggleShuffle,
    toggleSheet,
    closeSheet,
    setActiveTab,
    toggleFavorite,
    setPlayerInstance,
    updateProgress,
    onTrackEnded,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider")
  return ctx
}
