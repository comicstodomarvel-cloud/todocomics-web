import { NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    const user = await getAdminUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}
