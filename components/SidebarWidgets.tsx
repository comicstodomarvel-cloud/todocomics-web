import { Suspense } from 'react'
import type { DiscordData } from '@/lib/discordData'
import HashtagFilter from './HashtagFilter'
import UpdatesDropdownButton from './updates/UpdatesDropdownButton'
import DiscordCompactCard from './DiscordWidget/DiscordCompactCard'

export default function SidebarWidgets({
  discordData,
}: {
  discordData: DiscordData | null
}) {
  return (
    <div className="fixed left-4 top-4 z-50 safe-top safe-left hidden lg:flex flex-col gap-2">
      <Suspense fallback={null}>
        <HashtagFilter />
      </Suspense>
      <UpdatesDropdownButton />
      <DiscordCompactCard data={discordData} />
    </div>
  )
}
