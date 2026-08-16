import { isAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { AdminDashboard, AdminLogin } from '@/components/AdminPanel'
import type { AdminState } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Skryptorium — Krypta Kostiumów',
}

export default async function AdminPage() {
  const admin = await isAdmin()

  let data: AdminState | null = null
  if (admin) {
    const costumes = await prisma.costume.findMany({
      include: { person: { select: { id: true, display: true } } },
      orderBy: { createdAt: 'asc' },
    })
    const total = costumes.length
    const drawn = costumes.filter((c) => c.person).length
    data = {
      costumes: costumes.map((c) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.imageUrl,
        person: c.person
          ? { id: c.person.id, display: c.person.display }
          : null,
      })),
      total,
      drawn,
      remaining: total - drawn,
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      {admin && data ? (
        <AdminDashboard key="panel" data={data} />
      ) : (
        <AdminLogin key="login" />
      )}
    </div>
  )
}
