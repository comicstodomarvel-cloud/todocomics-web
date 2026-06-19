import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email es obligatorio' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.vercel.app'

    const admin = getSupabaseAdmin()
    const { error } = await admin.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      console.error('[api/auth/resend-confirmation] error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/auth/resend-confirmation] error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
