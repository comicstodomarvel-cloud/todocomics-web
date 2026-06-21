'use client'

import { HelpCircle, Pencil, Gift } from 'lucide-react'
import Link from 'next/link'
import OnlineCounter from './OnlineCounter'
import UpdatesDropdownButton from './updates/UpdatesDropdownButton'

const TERABOX_URL = 'https://www.terabox.com/referral/4401765338615'

export default function MobileActionBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 py-4">
      {/* Online Counter */}
      <div className="flex flex-col items-center gap-1">
        <OnlineCounter variant="toolbar" />
        <span className="text-[10px] font-medium text-zinc-500">Usuarios</span>
      </div>

      {/* FAQ */}
      <Link
        href="/faq"
        className="flex flex-col items-center gap-1 text-zinc-400 hover:text-amber-500 transition-colors"
      >
        <HelpCircle size={22} />
        <span className="text-[10px] font-medium">FAQ</span>
      </Link>

      {/* Pedir */}
      <Link
        href="/peticiones"
        className="flex flex-col items-center gap-1 text-zinc-400 hover:text-amber-500 transition-colors"
      >
        <Pencil size={22} />
        <span className="text-[10px] font-medium">Pedir</span>
      </Link>

      {/* Updates */}
      <div className="flex flex-col items-center gap-1">
        <UpdatesDropdownButton variant="toolbar" />
        <span className="text-[10px] font-medium text-zinc-500">Updates</span>
      </div>

      {/* Terabox */}
      <a
        href={TERABOX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
      >
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-3 py-1.5 rounded-full text-xs transition-all duration-200 hover:scale-105">
          <Gift size={16} />
          <span>1TB GRATIS</span>
        </div>
      </a>
    </div>
  )
}
