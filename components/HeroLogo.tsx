"use client"

import { useEffect, useRef, useState } from "react"

const LOGO_URL =
  "https://axfugtisjsjbkqlkixla.supabase.co/storage/v1/object/public/portadas/MTC.png"

function getImageLuminance(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = url
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      let total = 0
      let count = 0
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          const sx = (img.width * (x + 0.5)) / 5
          const sy = (img.height * (y + 0.5)) / 5
          canvas.width = 1
          canvas.height = 1
          ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1)
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
          total += 0.299 * r + 0.587 * g + 0.114 * b
          count++
        }
      }
      resolve(total / count)
    }
    img.onerror = () => reject()
  })
}

export default function HeroLogo({ imageUrl }: { imageUrl: string }) {
  const [textColor, setTextColor] = useState<"white" | "black">("white")

  useEffect(() => {
    getImageLuminance(imageUrl)
      .then((luminance) => setTextColor(luminance > 128 ? "black" : "white"))
      .catch(() => setTextColor("white"))
  }, [imageUrl])

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none md:hidden">
      <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-5 py-2 rounded-xl">
        <img
          src={LOGO_URL}
          alt="TodoComics"
          className="w-8 h-8 rounded-lg object-cover"
        />
        <span
          className={`text-xl font-bold tracking-tight ${
            textColor === "white" ? "text-white" : "text-black"
          }`}
        >
          TODOCOMICS
        </span>
      </div>
    </div>
  )
}
