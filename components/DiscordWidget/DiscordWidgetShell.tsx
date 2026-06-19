"use client"

import { useState } from "react"
import type { DiscordData } from "@/lib/discordData"
import DiscordPanel from "./DiscordPanel"
import MobileDiscordFab from "./MobileDiscordFab"

export default function DiscordWidgetShell({
  discordData,
}: {
  discordData: DiscordData | null
}) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <>
      <DiscordPanel
        data={discordData}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((v) => !v)}
      />
      <MobileDiscordFab />
    </>
  )
}
