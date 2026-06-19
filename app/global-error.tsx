"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg text-zinc-400">Error al cargar la aplicación</p>
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
      </body>
    </html>
  )
}
