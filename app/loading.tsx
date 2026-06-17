import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function Loading() {
  return (
    <div className="px-6 pb-12 pt-8 sm:px-10 md:px-16">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
