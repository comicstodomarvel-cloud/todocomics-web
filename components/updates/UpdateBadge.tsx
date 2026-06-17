import { isRecent } from '@/lib/dateUtils'

export default function UpdateBadge({ updateDate }: { updateDate: string }) {
  const date = new Date(updateDate)
  if (!isRecent(date, 7)) return null

  const isVeryRecent = isRecent(date, 3)

  return (
    <div
      className={`absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded ${
        isVeryRecent ? 'animate-pulse' : ''
      }`}
    >
      ACTUALIZADO
    </div>
  )
}
