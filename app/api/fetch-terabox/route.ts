import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const CACHE = new Map<string, { data: unknown; cachedAt: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000

const TERABOX_DOMAINS = [
  "terabox.com",
  "1024terabox.com",
  "freeterabox.com",
  "teraboxapp.com",
  "teraboxurl.com",
  "teraboxshare.com",
  "1024tera.com",
  "neva.ly",
]

const SHORTENER_PATTERN = /bit\.ly|shorturl|tinyurl|ow\.ly|is\.gd|shorte\.st|short\.link/i

async function resolveUrl(url: string): Promise<string> {
  if (!SHORTENER_PATTERN.test(url)) return url
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual" })
    return res.headers.get("location") || res.url || url
  } catch {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" })
      return res.url
    } catch {
      return url
    }
  }
}

function isTeraboxUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    return TERABOX_DOMAINS.some((d) => host === d || host.endsWith("." + d))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL requerida" },
        { status: 400 }
      )
    }

    const resolvedUrl = await resolveUrl(url.trim())

    if (!isTeraboxUrl(resolvedUrl)) {
      return NextResponse.json(
        {
          error:
            "Este extractor solo admite enlaces oficiales de TeraBox.",
        },
        { status: 400 }
      )
    }

    const cacheKey = resolvedUrl.toLowerCase()
    const cached = CACHE.get(cacheKey)
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
      return NextResponse.json({ ...(cached.data as object), fromCache: true })
    }

    const urlHash = createHash("sha256").update(cacheKey).digest("hex")
    const supabase = getSupabaseAdmin()

    try {
      const { data: cachedRow } = await supabase
        .from("terabox_cache")
        .select("response_json, created_at")
        .eq("url_hash", urlHash)
        .maybeSingle()

      if (cachedRow) {
        const age = Date.now() - new Date(cachedRow.created_at).getTime()
        if (age < CACHE_TTL) {
          CACHE.set(cacheKey, { data: cachedRow.response_json, cachedAt: Date.now() })
          return NextResponse.json({ ...cachedRow.response_json, fromCache: true })
        }
        await supabase.from("terabox_cache").delete().eq("url_hash", urlHash)
      }
    } catch {
      // table might not exist — continue to fetch fresh
    }

    const apiKey = process.env.XAPIVERSE_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key no configurada" },
        { status: 500 }
      )
    }

    const response = await fetch("https://xapiverse.com/api/terabox-pro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xAPIverse-Key": apiKey,
      },
      body: JSON.stringify({ url: resolvedUrl }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText || response.statusText },
        { status: 502 }
      )
    }

    const data = await response.json()

    CACHE.set(cacheKey, { data, cachedAt: Date.now() })

    try {
      await supabase
        .from("terabox_cache")
        .upsert(
          {
            url_hash: urlHash,
            url: cacheKey,
            response_json: data,
          },
          { onConflict: "url_hash" }
        )
        .maybeSingle()
    } catch {
      // cache write failure is non-fatal
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("Error en fetch-terabox:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
