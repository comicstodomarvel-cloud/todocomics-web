'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}

export default function ImageWithFallback({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 ${className ?? ''}`}
      >
        <div className="flex flex-col items-center gap-2 text-zinc-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs">Sin portada</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
