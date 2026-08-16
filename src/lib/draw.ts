import 'server-only'
import { prisma } from '@/lib/prisma'
import { normalizeName } from '@/lib/names'
import type { CostumeResult, DrawResult, LookupResult } from '@/lib/types'

function toCostume(c: { id: string; name: string; imageUrl: string | null }): CostumeResult {
  return { id: c.id, name: c.name, imageUrl: c.imageUrl }
}

export async function lookup(name: string): Promise<LookupResult> {
  const n = normalizeName(name)
  if (!n) return { state: 'invalid' }

  const person = await prisma.person.findUnique({
    where: { name: n.key },
    include: { costume: true },
  })

  if (person?.costume) {
    return { state: 'drawn', costume: toCostume(person.costume) }
  }

  const remaining = await prisma.costume.count({ where: { person: null } })
  return { state: 'envelope', remaining }
}

export async function draw(name: string): Promise<DrawResult> {
  const n = normalizeName(name)
  if (!n) return { state: 'invalid' }

  try {
    return await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT c.id
        FROM "Costume" c
        WHERE NOT EXISTS (SELECT 1 FROM "Person" p WHERE p."costumeId" = c.id)
        ORDER BY random()
        LIMIT 1
        FOR UPDATE OF c SKIP LOCKED
      `

      if (rows.length === 0) return { state: 'empty' }
      const costumeId = rows[0].id

      const existing = await tx.person.findUnique({
        where: { name: n.key },
        include: { costume: true },
      })

      if (existing?.costume) {
        return {
          state: 'already-drawn',
          costume: toCostume(existing.costume),
          displayName: existing.display,
        }
      }

      if (existing) {
        await tx.person.update({ where: { name: n.key }, data: { costumeId } })
      } else {
        await tx.person.create({ data: { name: n.key, display: n.display, costumeId } })
      }

      const costume = await tx.costume.findUniqueOrThrow({ where: { id: costumeId } })
      return { state: 'drawn', costume: toCostume(costume), displayName: n.display }
    })
  } catch (e) {
    if (isUniqueViolation(e)) return { state: 'taken' }
    throw e
  }
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code?: string }).code === 'P2002'
  )
}
