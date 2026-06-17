'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4">
      <p className="text-lg text-zinc-400">Error al cargar contenido</p>
      <p className="max-w-md text-center text-sm text-zinc-600">
        {error.message}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-amber-500 px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
