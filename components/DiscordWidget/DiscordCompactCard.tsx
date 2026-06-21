'use client'

import ServerIcon from './ServerIcon'
import type { DiscordData } from '@/lib/discordData'
import { ExternalLink } from 'lucide-react'

export default function DiscordCompactCard({
  data,
}: {
  data: DiscordData | null
}) {
  const { guildName, guildId, iconHash, customIconUrl, onlineCount, inviteCode } =
    data ?? {
      guildName: "TodoComics",
      guildId: "977358920702119997",
      iconHash: null,
      customIconUrl: null,
      onlineCount: 0,
      inviteCode: "nKTnYSTRHE",
    }

  return (
    <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-3 flex flex-col gap-2 w-44">
      <div className="flex items-center gap-2">
        <ServerIcon
          guildId={guildId}
          iconHash={iconHash}
          customIconUrl={customIconUrl}
          guildName={guildName}
          size={32}
        />
        <div className="min-w-0 flex-1">
          <p className="text-zinc-100 text-sm font-medium truncate leading-tight">
            {guildName}
          </p>
          <p className="text-zinc-500 text-xs truncate leading-tight flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
            {onlineCount} online
          </p>
        </div>
      </div>
      <a
        href={`https://discord.gg/${inviteCode}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5] px-3 py-1.5 text-xs font-semibold text-white transition-colors"
      >
        <ExternalLink size={12} />
        Unirse
      </a>
    </div>
  )
}
