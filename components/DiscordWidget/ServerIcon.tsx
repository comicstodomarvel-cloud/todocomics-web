"use client"

import { useState } from "react"
import { Hash } from 'lucide-react'

export default function ServerIcon({
  guildId,
  iconHash,
  guildName,
  size = 48,
  className = '',
}: {
  guildId: string
  iconHash: string | null
  guildName: string
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (iconHash && !failed) {
    const ext = iconHash.startsWith('a_') ? 'gif' : 'png'
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size * 2}`}
        alt={guildName}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-[#5865F2] flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Hash size={size * 0.45} className="text-white" />
    </div>
  )
}
