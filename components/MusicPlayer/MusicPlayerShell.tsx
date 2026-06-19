"use client"

import type { ReactNode } from "react"
import { PlayerProvider } from "@/lib/playerStore"
import type { Track } from "@/lib/musicData"
import YouTubeBridge from "./YouTubeBridge"
import DesktopPanel from "./DesktopPanel"
import MobileFAB from "./MobileFAB"
import MobileSheet from "./MobileSheet"

export default function MusicPlayerShell({
  children,
  playlist,
}: {
  children: ReactNode
  playlist: Track[]
}) {
  return (
    <PlayerProvider playlist={playlist}>
      <YouTubeBridge />
      {children}
      <DesktopPanel />
      <MobileFAB />
      <MobileSheet />
    </PlayerProvider>
  )
}
