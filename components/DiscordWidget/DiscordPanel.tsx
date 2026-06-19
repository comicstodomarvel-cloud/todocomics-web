"use client"

import ServerIcon from "./ServerIcon"
import type { DiscordData } from "@/lib/discordData"
import { ChevronLeft, ExternalLink, Hash, Users } from "lucide-react"

export default function DiscordPanel({
  data,
  isCollapsed,
  onToggle,
}: {
  data: DiscordData | null
  isCollapsed: boolean
  onToggle: () => void
}) {
  const { guildName, guildId, iconHash, customIconUrl, memberCount, onlineCount, inviteCode } =
    data ?? {
      guildName: "TodoComics",
      guildId: "977358920702119997",
      iconHash: null,
      customIconUrl: null,
      memberCount: 0,
      onlineCount: 0,
      inviteCode: "nKTnYSTRHE",
    }

  const channels = [
    { name: "anuncios", icon: "📢" },
    { name: "general", icon: "💬" },
    { name: "comunidad", icon: "👥" },
    { name: "cómics", icon: "📚" },
    { name: "reportes", icon: "🔧" },
  ]

  return (
    <>
      {/* Full panel */}
      <div
        className={`fixed top-0 left-0 w-72 h-screen bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800 z-50
          transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]
          hidden lg:flex flex-col
          ${isCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <span className="text-zinc-500 text-xs font-medium flex items-center gap-1.5">
            <Hash size={12} />
            Discord
          </span>
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
          >
            <span className="text-xs">Colapsar</span>
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Server info */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-4">
          <ServerIcon
            guildId={guildId}
            iconHash={iconHash}
            customIconUrl={customIconUrl}
            guildName={guildName}
            size={80}
            className="shadow-lg"
          />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-zinc-100">{guildName}</h2>
            <p className="text-xs text-zinc-500 mt-1 flex items-center justify-center gap-1.5">
              <Users size={12} />
              {memberCount.toLocaleString()} miembros
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {onlineCount} online ahora
          </div>
        </div>

        {/* Join button */}
        <div className="px-4 pb-6">
          <a
            href={`https://discord.gg/${inviteCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5] px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <ExternalLink size={14} />
            Unirse a Discord
          </a>
        </div>

        {/* Channels */}
        <div className="border-t border-zinc-800/50 flex-1 pt-4 px-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold mb-3 px-1">
            Canales de texto
          </p>
          <div className="space-y-0.5">
            {channels.map((ch) => (
              <div
                key={ch.name}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-zinc-400 text-sm hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors cursor-default"
              >
                <span className="text-xs">{ch.icon}</span>
                <span>{ch.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mini collapsed card */}
      <button
        onClick={onToggle}
        className={`fixed left-0 z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl
          transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]
          hidden lg:flex items-center gap-3 px-3 py-2.5 cursor-pointer
          ${
            isCollapsed
              ? "translate-x-0 top-1/2 -translate-y-1/2 w-56 rounded-r-xl"
              : "-translate-x-[calc(100%+120px)] top-1/2 -translate-y-1/2 w-56 rounded-r-xl pointer-events-none"
          }
          hover:translate-x-1 group
        `}
        style={{
          transitionProperty: "transform, opacity",
        }}
        aria-label={isCollapsed ? "Abrir Discord" : "Discord"}
        tabIndex={isCollapsed ? 0 : -1}
      >
        <ServerIcon
          guildId={guildId}
          iconHash={iconHash}
          customIconUrl={customIconUrl}
          guildName={guildName}
          size={36}
        />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-zinc-100 text-sm font-medium truncate leading-tight">
            {guildName}
          </p>
          <p className="text-zinc-500 text-xs truncate leading-tight flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
            {onlineCount} online
          </p>
        </div>
        <ChevronLeft
          size={16}
          className="text-zinc-500 flex-shrink-0 group-hover:text-zinc-300 transition-colors"
        />

        {/* Hover indicator */}
        <div className="absolute inset-y-0 right-0 w-1 bg-[#5865F2]/0 group-hover:bg-[#5865F2]/50 rounded-r-xl transition-all" />
      </button>
    </>
  )
}
