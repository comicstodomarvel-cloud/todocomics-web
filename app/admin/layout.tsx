import type { Metadata } from 'next'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminHeader>{children}</AdminHeader>
}
