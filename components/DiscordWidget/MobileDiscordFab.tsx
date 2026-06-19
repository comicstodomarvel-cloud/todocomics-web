"use client"

import { MessageCircle } from "lucide-react"

const INVITE_URL = "https://discord.gg/nKTnYSTRHE"

export default function MobileDiscordFab() {
  return (
    <a
      href={INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-5 z-50
        lg:hidden flex items-center justify-center
        w-12 h-12 rounded-full
        bg-[#5865F2] hover:bg-[#4752C4]
        shadow-[0_4px_20px_rgba(88,101,242,0.4)]
        transition-all duration-300 active:scale-90
      "
      aria-label="Unirse a Discord"
    >
      <MessageCircle size={20} className="text-white" />
    </a>
  )
}
