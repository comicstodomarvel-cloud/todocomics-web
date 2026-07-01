import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import AdminHeader from '@/components/admin/AdminHeader'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getAdminUserFromCookies, hasPermission, getAdminUserFromDB } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const PATH_TO_SECTION: Record<string, string> = {
  '/admin': '',
  '/admin/importar': 'importar',
  '/admin/editar': 'editar',
  '/admin/eliminar': 'eliminar',
  '/admin/revisar': 'revisar',
  '/admin/faq': 'faq',
  '/admin/peticiones': 'peticiones',
  '/admin/reportes': 'reportes',
  '/admin/monitoreo': 'monitoreo',
  '/admin/usuarios': 'usuarios',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabaseAdmin = getSupabaseAdmin()
  const { count } = await supabaseAdmin.from('admins').select('*', { count: 'exact', head: true })

  if (!count || count === 0) {
    redirect('/admin/setup')
  }

  let user = await getAdminUserFromCookies()
  if (!user) {
    redirect('/admin/login')
  }

  // Fetch fresh permissions from DB (so edits take effect immediately)
  if (user.role !== 'admin') {
    const fresh = await getAdminUserFromDB(user.id)
    if (fresh) user = fresh
  }

  // Route-level permission enforcement
  const headersList = await headers()
  const pathname = headersList.get('x-next-pathname') || headersList.get('x-invoke-path') || ''
  const section = PATH_TO_SECTION[pathname]

  if (section && !hasPermission(user, section)) {
    redirect('/admin')
  }

  return <AdminHeader user={user}>{children}</AdminHeader>
}
