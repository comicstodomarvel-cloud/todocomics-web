import type { Metadata } from 'next'
import PeticionForm from '@/components/PeticionForm'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.com'

export const metadata: Metadata = {
  title: 'Solicitar un Cómic - TodoComics',
  description:
    '¿No encuentras un cómic en nuestro catálogo? Solicítalo y haremos lo posible por agregarlo.',
  alternates: {
    canonical: '/peticiones',
  },
  openGraph: {
    title: 'Solicitar un Cómic - TodoComics',
    description:
      '¿No encuentras un cómic en nuestro catálogo? Solicítalo y haremos lo posible por agregarlo.',
    siteName: 'TodoComics',
    url: `${siteUrl}/peticiones`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solicitar un Cómic - TodoComics',
    description:
      '¿No encuentras un cómic en nuestro catálogo? Solicítalo y haremos lo posible por agregarlo.',
  },
}

export default function PeticionesPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <PeticionForm />
    </div>
  )
}
