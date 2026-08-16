'use server'

import { revalidatePath } from 'next/cache'
import { draw, lookup } from '@/lib/draw'
import {
  clearAdminCookie,
  isAdmin,
  setAdminCookie,
  verifyPasscode,
} from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import type { DrawResult, LookupResult } from '@/lib/types'

export async function lookupName(name: string): Promise<LookupResult> {
  return lookup(name)
}

export async function drawCostume(name: string): Promise<DrawResult> {
  return draw(name)
}

export async function adminLogin(
  passcode: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.ADMIN_PASSCODE) {
    return { ok: false, error: 'Hasło admina nie jest skonfigurowane na serwerze.' }
  }
  const valid = await verifyPasscode(passcode)
  if (!valid) return { ok: false, error: 'Złe zaklęcie. Ciemność nie otwiera się przed Tobą.' }
  await setAdminCookie()
  revalidatePath('/admin')
  return { ok: true }
}

export async function adminLogout(): Promise<void> {
  await clearAdminCookie()
  revalidatePath('/admin')
}

export async function addCostume(
  name: string,
  imageUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: 'Brak uprawnień.' }

  const trimmedName = name.trim().replace(/\s+/g, ' ')
  if (!trimmedName || trimmedName.length > 100) {
    return { ok: false, error: 'Podaj nazwę kostiumu (max 100 znaków).' }
  }

  let url: string | null = null
  const trimmedUrl = imageUrl.trim()
  if (trimmedUrl) {
    try {
      const parsed = new URL(trimmedUrl)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('not http')
      }
      if (parsed.href.length > 500) {
        return { ok: false, error: 'Adres obrazka jest za długi.' }
      }
      url = parsed.href
    } catch {
      return { ok: false, error: 'Niepoprawny adres obrazka (wymagany http/https).' }
    }
  }

  await prisma.costume.create({ data: { name: trimmedName, imageUrl: url } })
  revalidatePath('/admin')
  return { ok: true }
}

export async function deleteCostume(id: string): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false }
  await prisma.costume.deleteMany({ where: { id, person: null } })
  revalidatePath('/admin')
  return { ok: true }
}

export async function undoDraw(personId: string): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false }
  await prisma.person.update({ where: { id: personId }, data: { costumeId: null } })
  revalidatePath('/admin')
  return { ok: true }
}

export async function resetDraws(): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false }
  await prisma.person.deleteMany()
  revalidatePath('/admin')
  return { ok: true }
}
