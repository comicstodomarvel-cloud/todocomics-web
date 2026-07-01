import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from './supabase-admin'

const SALT_ROUNDS = 10

export interface AdminUser {
  id: string
  username: string
  role: 'admin' | 'editor'
  display_name: string
}

interface AdminTokenPayload extends JWTPayload {
  id: string
  username: string
  role: 'admin' | 'editor'
  display_name: string
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET no está definida')
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(user: AdminUser): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    display_name: user.display_name,
  } as AdminTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecret())

  return token
}

export async function getAdminUserFromRequest(request: Request): Promise<AdminUser | null> {
  try {
    const token = request.headers.get('cookie')
      ?.split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('admin_token='))
      ?.split('=')[1]

    if (!token) return null

    const decoded = await jwtVerify(token, getJwtSecret())
    const payload = decoded.payload as AdminTokenPayload

    if (!payload.id || !payload.role) return null

    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      display_name: payload.display_name || payload.username,
    }
  } catch {
    return null
  }
}

export async function getAdminUserFromCookies(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return null

    const decoded = await jwtVerify(token, getJwtSecret())
    const payload = decoded.payload as AdminTokenPayload

    if (!payload.id || !payload.role) return null

    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      display_name: payload.display_name || payload.username,
    }
  } catch {
    return null
  }
}

export async function checkAdminsExist(): Promise<boolean> {
  const admin = getSupabaseAdmin()
  const { count } = await admin.from('admins').select('*', { count: 'exact', head: true })
  return (count ?? 0) > 0
}

export function isAdmin(user: AdminUser | null): boolean {
  return user?.role === 'admin'
}

export function isEditorOrAdmin(user: AdminUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'editor'
}

export async function checkAdminFromRequest(request: Request): Promise<AdminUser | null> {
  const user = await getAdminUserFromRequest(request)
  if (user) return user

  const headerKey = request.headers.get('x-admin-key')
  if (headerKey && headerKey === process.env.ADMIN_KEY) {
    return { id: '', username: 'admin', role: 'admin', display_name: 'Admin' }
  }

  return null
}

export function requireAdminRole(user: AdminUser | null): boolean {
  return user?.role === 'admin'
}

export function requireEditorOrAdmin(user: AdminUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'editor'
}
