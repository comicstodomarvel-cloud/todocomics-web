import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import AdminHeader from '@/components/admin/AdminHeader'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { jwtVerify } from 'jose'
import type { AdminUser } from '@/lib/admin-auth'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

async function getAuthUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return null

    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) return null

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    if (!payload.id || !payload.role) return null

    return {
      id: payload.id as string,
      username: payload.username as string,
      role: payload.role as 'admin' | 'editor',
      display_name: (payload.display_name as string) || (payload.username as string),
    }
  } catch {
    return null
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-next-pathname') || headersList.get('x-invoke-path') || ''

  // Permitir /admin/setup y /admin/login sin auth
  if (pathname === '/admin/setup' || pathname === '/admin/login') {
    return <>{children}</>
  }

  const admin = getSupabaseAdmin()
  const { count } = await admin.from('admins').select('*', { count: 'exact', head: true })

  if (!count || count === 0) {
    redirect('/admin/setup')
  }

  const user = await getAuthUser()
  if (!user) {
    redirect('/admin/login')
  }

  return <AdminHeader user={user}>{children}</AdminHeader>
}
