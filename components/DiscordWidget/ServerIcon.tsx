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
  if (iconHash) {
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png?size=${size * 2}`}
        alt={guildName}
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
