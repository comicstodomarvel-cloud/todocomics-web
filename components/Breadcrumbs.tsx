import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import JsonLd from './JsonLd'

interface Crumb {
  label: string
  href?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.com'}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <JsonLd data={schema as Record<string, unknown>} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
          <li>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              <Home size={14} />
              <span className="sr-only">Inicio</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={14} />
              {item.href ? (
                <Link href={item.href} className="hover:text-amber-400 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-300 truncate max-w-[200px]">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
