"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import type { DiscordData } from "@/lib/discordData"
import DiscordPanel from "./DiscordPanel"
import MobileDiscordFab from "./MobileDiscordFab"

export default function DiscordWidgetShell({
  discordData,
}: {
  discordData: DiscordData | null
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)

  if (pathname !== '/') return null

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
