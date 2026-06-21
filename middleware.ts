import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BAD_BOTS = [
  'ahrefsbot',
  'semrushbot',
  'siteauditbot',
  'majestic',
  'rogerbot',
  'dotbot',
  'megaindex',
  'crawler',
  'bingpreview',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = (request.headers.get('user-agent') ?? '').toLowerCase()

  if (BAD_BOTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse('Access denied', { status: 403 })
  }

  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
