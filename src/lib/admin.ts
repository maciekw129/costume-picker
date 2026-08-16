import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'cp_admin'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function adminToken(): string | null {
  const passcode = process.env.ADMIN_PASSCODE
  if (!passcode) return null
  return createHash('sha256').update(`cp-admin:${passcode}`).digest('hex')
}

export async function isAdmin(): Promise<boolean> {
  const expected = adminToken()
  if (!expected) return false

  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return false

  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function verifyPasscode(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSCODE
  if (!expected) return false

  const a = Buffer.from(expected)
  const b = Buffer.from(input)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function setAdminCookie(): Promise<void> {
  const token = adminToken()
  if (!token) return

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
