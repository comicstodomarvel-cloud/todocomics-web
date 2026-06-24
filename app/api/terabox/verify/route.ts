import { NextResponse } from "next/server"
import { createHash, randomBytes } from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

function generateToken(ip: string, userAgent: string): { token: string; hash: string } {
  const raw = `${ip}|${userAgent}|${Date.now()}|${randomBytes(16).toString("hex")}`
  const secret = process.env.XAPIVERSE_KEY || "fallback-secret"
  const hash = createHash("sha256").update(raw + secret).digest("hex")
  return { token: `${Buffer.from(raw).toString("base64")}.${hash.slice(0, 16)}`, hash }
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

    const { token, hash } = generateToken(ip, userAgent)

    const supabase = getSupabaseAdmin()

    const { count } = await supabase
      .from("terabox_verificaciones")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (!count || count === 0) {
      const { error } = await supabase.from("terabox_verificaciones").insert({
        ip,
        user_agent: userAgent,
        token_hash: hash,
      })
      if (error) {
        console.error("Error guardando verificación:", error)
      }
    }

    return NextResponse.json({ token, expiresIn: 7 * 24 * 60 * 60 * 1000 })
  } catch (err) {
    console.error("Error en verify:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
