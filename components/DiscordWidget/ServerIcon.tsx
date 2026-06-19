"use client"

import { useState } from "react"
import { Hash } from 'lucide-react'

export default function ServerIcon({
  guildId,
  iconHash,
  customIconUrl,
  guildName,
  size = 48,
  className = '',
}: {
  guildId: string
  iconHash: string | null
  customIconUrl?: string | null
  guildName: string
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  const src = customIconUrl
    ? customIconUrl
    : iconHash
      ? `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${iconHash.startsWith('a_') ? 'gif' : 'png'}?size=${size * 2}`
      : null

  if (src && !failed) {
    return (
      <img
        src={src}
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
