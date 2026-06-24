import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const CACHE = new Map<string, { data: unknown; cachedAt: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000

function verifyToken(token: string, ip: string, userAgent: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 2) return false
    const raw = Buffer.from(parts[0], "base64").toString("utf-8")
    const [storedIp, storedUa, ,] = raw.split("|")
    if (storedIp !== ip || storedUa !== userAgent) return false
    const secret = process.env.XAPIVERSE_KEY || "fallback-secret"
    const expectedHash = createHash("sha256").update(raw + secret).digest("hex").slice(0, 16)
    if (parts[1] !== expectedHash) return false
    const [, , storedTime] = raw.split("|")
    const elapsed = Date.now() - Number(storedTime)
    if (elapsed > 7 * 24 * 60 * 60 * 1000) return false
    return true
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin") || request.headers.get("referer") || ""
    if (!origin.includes("todocomics.com") && !origin.includes("localhost")) {
      return NextResponse.json({ error: "Acceso no permitido" }, { status: 403 })
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const body = await request.json()
    const { url, token } = body

    if (!url || !token) {
      return NextResponse.json({ error: "url y token requeridos" }, { status: 400 })
    }

    if (!verifyToken(token, ip, userAgent)) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }

    const cacheKey = url.trim().toLowerCase()

    // 1. In-memory cache hit (misma instancia)
    const cached = CACHE.get(cacheKey)
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // 2. Supabase persistent cache hit (entre instancias)
    const urlHash = createHash("sha256").update(cacheKey).digest("hex")
    const supabase = getSupabaseAdmin()

    const { data: cachedRow } = await supabase
      .from("terabox_cache")
      .select("response_json, created_at")
      .eq("url_hash", urlHash)
      .single()

    if (cachedRow) {
      const age = Date.now() - new Date(cachedRow.created_at).getTime()
      if (age < CACHE_TTL) {
        CACHE.set(cacheKey, { data: cachedRow.response_json, cachedAt: Date.now() })
        return NextResponse.json(cachedRow.response_json)
      }
      await supabase.from("terabox_cache").delete().eq("url_hash", urlHash)
    }

    // 3. Miss total — llamar a xapiverse
    const apiKey = process.env.XAPIVERSE_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 })
    }

    const response = await fetch("https://xapiverse.com/api/terabox-pro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xAPIverse-Key": apiKey,
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("xapiverse error:", response.status, errorText)
      return NextResponse.json(
        { error: `Error del servicio externo: ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json()

    // 4. Guardar en ambas caches
    CACHE.set(cacheKey, { data, cachedAt: Date.now() })

    await supabase.from("terabox_cache").upsert(
      {
        url_hash: urlHash,
        url: cacheKey,
        response_json: data,
      },
      { onConflict: "url_hash" }
    ).maybeSingle()

    return NextResponse.json(data)
  } catch (err) {
    console.error("Error en download:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
