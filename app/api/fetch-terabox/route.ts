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
  "terabox.app",
  "neva.ly",
]

const SHORTENER_PATTERN = /bit\.ly|shorturl|tinyurl|ow\.ly|is\.gd|shorte\.st|short\.link/i

async function resolveUrl(url: string): Promise<string> {
  if (!SHORTENER_PATTERN.test(url)) return url
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" })
    return res.url
  } catch {
    return url
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

const DOMAIN_MAP: Record<string, string> = {
  "1024tera.com": "1024terabox.com",
  "terabox.app": "1024terabox.com",
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const surl = parsed.searchParams.get("surl")
    if (surl) {
      parsed.pathname = "/s/" + surl
      parsed.search = ""
    }
    return parsed.toString()
  } catch {
    return url
  }
}

function buildUrlVariants(normalizedUrl: string): string[] {
  const variants = [normalizedUrl]
  try {
    const parsed = new URL(normalizedUrl)
    const hostname = parsed.hostname.replace(/^www\./, "")
    const mapped = DOMAIN_MAP[hostname]
    if (mapped && mapped !== hostname) {
      parsed.hostname = mapped
      variants.push(parsed.toString())
    }
  } catch {}
  return variants
}

const BROWSER_HEADERS = {
  "Origin": "https://xapiverse.com",
  "Referer": "https://xapiverse.com/apis/terabox-pro",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
}

const XAPI_ENDPOINTS = [
  "https://xapiverse.com/api/terabox-pro",
]

let lastErrorBody = ""

async function callXapi(
  url: string,
  apiKey: string
): Promise<{ ok: boolean; status: number; body: string }> {
  const variants = buildUrlVariants(url)
  for (const variant of variants) {
    for (const endpoint of XAPI_ENDPOINTS) {
      const logLabel = `${endpoint} (url: ${variant})`
      console.log("[fetch-terabox] Intentando:", logLabel)
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xAPIverse-Key": apiKey,
            ...BROWSER_HEADERS,
          },
          body: JSON.stringify({ url: variant }),
        })
        const body = await res.text()
        console.log(`[fetch-terabox] ${logLabel}: status=${res.status}`)
        if (res.ok) {
          console.log(`[fetch-terabox] Exito con ${logLabel}`)
          return { ok: true, status: res.status, body }
        }
        lastErrorBody = body
        console.log(`[fetch-terabox] Fallo ${logLabel}: status=${res.status}`)
      } catch (err) {
        console.error(`[fetch-terabox] Error en ${logLabel}:`, err)
      }
    }
  }
  return { ok: false, status: 502, body: lastErrorBody }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 })
    }

    const resolvedUrl = await resolveUrl(url.trim())
    const normalizedUrl = normalizeUrl(resolvedUrl)

    console.log("[fetch-terabox] URL resuelta:", resolvedUrl)
    console.log("[fetch-terabox] URL normalizada:", normalizedUrl)

    if (!isTeraboxUrl(normalizedUrl)) {
      return NextResponse.json(
        { error: "Este extractor solo admite enlaces oficiales de TeraBox." },
        { status: 400 }
      )
    }

    const cacheKey = normalizedUrl.toLowerCase()
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
      console.error("[fetch-terabox] XAPIVERSE_KEY no configurada")
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 })
    }

    console.log("[fetch-terabox] URL recibida:", url.trim())
    console.log("[fetch-terabox] URL normalizada (enviada):", normalizedUrl)
    console.log("[fetch-terabox] API key presente:", !!apiKey)

    const xapiResult = await callXapi(normalizedUrl, apiKey)
    const xapiBody = xapiResult.body

    console.log("[fetch-terabox] XAPIverse status:", xapiResult.status)
    console.log("[fetch-terabox] XAPIverse body:", xapiBody)

    if (!xapiResult.ok) {
      let errorPayload
      try {
        errorPayload = JSON.parse(xapiBody)
      } catch {
        errorPayload = { message: xapiBody || "Error desconocido" }
      }
      return NextResponse.json(
        {
          error: errorPayload.message || errorPayload.error || xapiBody,
          code: errorPayload.code,
          details: errorPayload.details,
        },
        { status: 502 }
      )
    }

    let data
    try {
      data = JSON.parse(xapiBody)
    } catch {
      console.error("[fetch-terabox] XAPIverse response no es JSON:", xapiBody)
      return NextResponse.json(
        { error: "Respuesta inválida del servidor externo" },
        { status: 502 }
      )
    }

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
