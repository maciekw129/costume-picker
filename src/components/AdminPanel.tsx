'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  addCostume,
  adminLogin,
  adminLogout,
  deleteCostume,
  resetDraws,
  undoDraw,
} from '@/app/actions'
import type { AdminState } from '@/lib/types'

export function AdminLogin() {
  const router = useRouter()
  const [passcode, setPasscode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!passcode) return
    setPending(true)
    const res = await adminLogin(passcode)
    setPending(false)
    if (!res.ok) {
      setError(res.error ?? 'Coś poszło nie tak.')
      setPasscode('')
      return
    }
    router.refresh()
  }

  return (
    <div className="panel reveal-in w-full p-5 sm:p-8">
      <h1 className="font-display text-3xl text-ember drop-shadow-[0_0_20px_rgba(255,122,24,0.35)] sm:text-4xl">
        Skryptorium
      </h1>
      <p className="mt-2 text-sm text-bone-dim">
        Wypowiedz zaklęcie, aby wejść do podziemi.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="admin-passcode" className="mb-2 block text-sm text-ghost">
            Zaklęcie (hasło admina)
          </label>
          <input
            id="admin-passcode"
            type="password"
            className="input-dark"
            placeholder="••••••••"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoComplete="current-password"
            autoFocus
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-blood/50 bg-blood/10 px-4 py-2 text-sm text-rose-200"
          >
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={pending || !passcode}>
          {pending && <Spinner />}
          Odpieczętuj
        </button>
      </form>
    </div>
  )
}

export function AdminDashboard({ data }: { data: AdminState }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function refresh() {
    router.refresh()
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setBusy('add')
    const res = await addCostume(name, imageUrl)
    setBusy(null)
    if (!res.ok) {
      setError(res.error ?? 'Nie udało się dodać kostiumu.')
      return
    }
    setName('')
    setImageUrl('')
    refresh()
  }

  async function handleDelete(id: string) {
    setBusy(id)
    await deleteCostume(id)
    setBusy(null)
    refresh()
  }

  async function handleUndo(personId: string, personName: string) {
    if (!window.confirm(`Cofnąć losowanie dla ${personName}? Kostium wróci do puli.`)) return
    setBusy(personId)
    await undoDraw(personId)
    setBusy(null)
    refresh()
  }

  async function handleReset() {
    if (
      !window.confirm(
        'Przywrócić wszystkie losowania? Wszyscy stracą kostiumy, a pula będzie pełna. Kostiumy zostaną.',
      )
    ) {
      return
    }
    setBusy('reset')
    await resetDraws()
    setBusy(null)
    refresh()
  }

  async function handleLogout() {
    await adminLogout()
    router.refresh()
  }

  return (
    <div className="reveal-in flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ember drop-shadow-[0_0_20px_rgba(255,122,24,0.35)] sm:text-4xl">
            Skryptorium
          </h1>
          <p className="mt-1 text-sm text-bone-dim">Komora zarządzania kostiumami i losami.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost">
          Wyjdź
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Kostiumy" value={data.total} accent="text-ghost" />
        <StatCard label="Przydzielone" value={data.drawn} accent="text-toxic" />
        <StatCard label="W puli" value={data.remaining} accent="text-ember" />
      </div>

      <div className="panel p-4 sm:p-6">
        <h2 className="font-display text-xl text-ghost sm:text-2xl">Dodaj kostium</h2>
        <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_1.6fr]">
            <input
              aria-label="Nazwa kostiumu"
              className="input-dark"
              placeholder="Nazwa kostiumu *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <input
              aria-label="Adres obrazka"
              className="input-dark"
              placeholder="Adres obrazka (opcjonalnie)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              maxLength={500}
            />
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-blood/50 bg-blood/10 px-4 py-2 text-sm text-rose-200"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={busy === 'add' || !name.trim()}>
              {busy === 'add' && <Spinner />}
              Wrzuć do puli
            </button>
            <button type="button" className="btn btn-danger" disabled={busy !== null} onClick={handleReset}>
              {busy === 'reset' && <Spinner light />}
              Przywróć wszystkie losowania
            </button>
          </div>
        </form>
      </div>

      <div className="panel p-4 sm:p-6">
        <h2 className="font-display text-xl text-ghost sm:text-2xl">Kostiumy w puli</h2>
        {data.costumes.length === 0 ? (
          <p className="mt-4 text-sm text-bone-dim">
            Pula jest pusta. Dodaj kostiumy, aby otworzyć losowanie.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-arcane/20">
            {data.costumes.map((c) => (
              <li key={c.id} className="flex items-center gap-2 py-3 sm:gap-4">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-arcane/30 bg-black/40 sm:h-12 sm:w-12">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-bone-dim">
                      ✝
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-bone">{c.name}</p>
                  {c.person ? (
                    <p className="truncate text-xs text-toxic sm:text-sm">
                      <span className="hidden sm:inline">Przydzielony: </span>
                      <span className="font-semibold">{c.person.display}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-bone-dim">W puli</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1 sm:gap-2">
                  {c.person ? (
                    <button
                      className="btn btn-danger px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs"
                      disabled={busy !== null}
                      onClick={() => handleUndo(c.person!.id, c.person!.display)}
                    >
                      {busy === c.person!.id && <Spinner light />}
                      Cofnij
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs"
                      disabled={busy !== null}
                      onClick={() => handleDelete(c.id)}
                    >
                      Usuń
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="panel flex flex-col items-center gap-1 px-2 py-3 sm:px-3 sm:py-4">
      <span className={`font-display text-2xl leading-none sm:text-3xl ${accent}`}>{value}</span>
      <span className="text-[10px] leading-tight text-bone-dim sm:text-xs">{label}</span>
    </div>
  )
}

function Spinner({ light }: { light?: boolean }) {
  return <span className={light ? 'spinner-light' : 'spinner'} />
}
