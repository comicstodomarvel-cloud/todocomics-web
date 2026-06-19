import { AlertTriangle } from 'lucide-react'

export default function ReportedBadge() {
  return (
    <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-600/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-sm">
      <AlertTriangle size={10} />
      Reportado
    </span>
  )
}
