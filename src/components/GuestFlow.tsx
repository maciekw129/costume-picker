'use client'

import { useState } from 'react'
import Link from 'next/link'
import { drawCostume, lookupName } from '@/app/actions'
import type { CostumeResult } from '@/lib/types'

type Phase = 'name' | 'envelope' | 'revealed'

function JackOLantern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <ellipse cx="60" cy="72" rx="48" ry="26" fill="#ff7a18" />
      <ellipse cx="60" cy="50" rx="42" ry="34" fill="#ff9a3c" />
      <path d="M38 42 L48 52 L38 60 Z" fill="#1a0f00" />
      <path d="M82 42 L72 52 L82 60 Z" fill="#1a0f00" />
      <path d="M52 70 L60 82 L68 70 Z" fill="#1a0f00" />
      <rect x="56" y="10" width="8" height="14" rx="3" fill="#3e5a1f" />
    </svg>
  )
}

function EnvelopeSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 84" className={className} aria-hidden="true">
      <rect
        x="2"
        y="4"
        width="116"
        height="76"
        rx="8"
        fill="#2a1b33"
        stroke="#a855f7"
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      <path d="M2 16 L60 54 L118 16 L118 10 Q118 4 110 4 L10 4 Q2 4 2 10 Z" fill="#1c1126" />
      <path
        d="M2 16 L60 54 L118 16"
        fill="none"
        stroke="#ff7a18"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="54" r="10" fill="#e11d48" stroke="#ff9db0" strokeWidth="2" />
      <path d="M60 46 L60 62 M52 54 L68 54" stroke="#ff9db0" strokeWidth="2" />
    </svg>
  )
}

function GhostSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 130" className={className} aria-hidden="true">
      <path
        d="M60 10 C35 10 18 28 18 55 C18 85 25 115 30 122 C35 128 40 120 45 124 C50 128 55 120 60 124 C65 128 70 120 75 124 C80 120 85 128 90 122 C95 115 102 85 102 55 C102 28 85 10 60 10 Z"
        fill="#cbbcf0"
        opacity="0.5"
      />
      <circle cx="44" cy="48" r="5" fill="#1a0f22" />
      <circle cx="76" cy="48" r="5" fill="#1a0f22" />
      <path d="M44 70 Q60 82 76 70" stroke="#1a0f22" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function GuestFlow() {
  const [phase, setPhase] = useState<Phase>('name')
  const [name, setName] = useState('')
  const [pendingName, setPendingName] = useState(false)
  const [pendingDraw, setPendingDraw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [costume, setCostume] = useState<CostumeResult | null>(null)
  const [displayName, setDisplayName] = useState('')

  async function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) return
    setPendingName(true)
    const res = await lookupName(trimmed)
    setPendingName(false)
    if (res.state === 'invalid') {
      setError('Imię może zawierać tylko litery, cyfry, spacje, myślniki i apostrofy.')
      return
    }
    if (res.state === 'drawn') {
      setCostume(res.costume)
      setDisplayName(trimmed)
      setPhase('revealed')
      return
    }
    setRemaining(res.remaining)
    setPhase('envelope')
  }

  async function handleDraw() {
    setError(null)
    setPendingDraw(true)
    const res = await drawCostume(name)
    setPendingDraw(false)
    if (res.state === 'drawn' || res.state === 'already-drawn') {
      setCostume(res.costume)
      setDisplayName(res.displayName)
      setPhase('revealed')
    } else if (res.state === 'empty') {
      setError('Wszystkie kostiumy zostały już wylosowane. Za późno, upiorze!')
    } else if (res.state === 'taken') {
      setError('Ktoś właśnie zajął to imię. Wybierz inne i spróbuj ponownie.')
      setPhase('name')
    } else {
      setError('Coś poszło nie tak. Spróbuj jeszcze raz.')
    }
  }

  function handleReset() {
    setPhase('name')
    setName('')
    setCostume(null)
    setError(null)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-2 px-4 py-12">
        <JackOLantern className="float-bob h-20 w-24 drop-shadow-[0_0_18px_rgba(255,122,24,0.55)]" />
        <h1 className="flicker font-display text-center text-5xl leading-tight text-ember drop-shadow-[0_0_24px_rgba(255,122,24,0.35)] sm:text-6xl">
          Krypta Kostiumów
        </h1>
        <p className="text-center text-sm text-bone-dim sm:text-base">
          Halloweenowa loteria przebrań. Wejdź, a los wskaże Twój strój.
        </p>

        <div className="panel reveal-in mt-8 w-full p-6 sm:p-8">
          {phase === 'name' && (
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="guest-name"
                  className="mb-2 block font-display text-2xl text-ghost"
                >
                  Jak masz na imię, śmiałku?
                </label>
                <input
                  id="guest-name"
                  className="input-dark"
                  placeholder="np. Ania"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              {error && <ErrorBanner message={error} />}
              <button type="submit" className="btn btn-primary" disabled={pendingName || !name.trim()}>
                {pendingName ? <Spinner /> : 'Wkrocz do krypty'}
              </button>
            </form>
          )}

          {phase === 'envelope' && (
            <div className="flex flex-col items-center gap-5">
              <p className="text-center text-sm text-bone-dim sm:text-base">
                {displayName || name.trim()}, w kryptach pozostało{' '}
                <span className="font-bold text-ember">{remaining}</span>{' '}
                {remaining === 1 ? 'kostium' : remaining < 5 ? 'kostiumy' : 'kostiumów'}.
              </p>
              {error && <ErrorBanner message={error} />}
              <button
                onClick={handleDraw}
                disabled={pendingDraw || remaining === 0}
                className="envelope-cta btn btn-primary flex-col gap-1 px-10 py-6"
                style={{ transform: 'scale(1)' }}
              >
                <EnvelopeSvg className="h-16 w-24" />
                <span className="flex items-center gap-2">
                  {pendingDraw && <Spinner light />}
                  Otwórz kopertę
                </span>
              </button>
              <p className="text-center text-xs text-bone-dim">
                Jeden los na osobę. Decyzja losu jest ostateczna.
              </p>
              {remaining === 0 && (
                <p className="text-center text-sm text-blood">Pula jest pusta.</p>
              )}
            </div>
          )}

          {phase === 'revealed' && costume && (
            <div className="reveal-in flex flex-col items-center gap-5">
              <h2 className="font-display text-3xl text-toxic drop-shadow-[0_0_16px_rgba(163,230,53,0.4)]">
                Twój los został przypieczętowany
              </h2>
              <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-arcane/40 bg-black/30 p-6">
                {costume.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={costume.imageUrl}
                    alt={costume.name}
                    className="h-48 w-48 rounded-lg object-cover shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <GhostSvg className="h-40 w-40 drop-shadow-[0_0_18px_rgba(203,188,240,0.35)]" />
                )}
                <div className="text-center">
                  <p className="text-sm text-bone-dim">
                    {displayName}, tej nocy wcielasz się w:
                  </p>
                  <p className="font-display text-4xl text-ember">{costume.name}</p>
                </div>
              </div>
              <p className="text-center text-xs text-bone-dim">
                Wróć tu przed imprezą i podaj swoje imię, aby znów zobaczyć kostium.
                Nie mów nikomu, co wylosowałeś — niech strój będzie niespodzianką.
              </p>
              <button onClick={handleReset} className="btn btn-ghost">
                Losuj dla kogoś innego
              </button>
            </div>
          )}
        </div>

        <footer className="mt-8 flex flex-col items-center gap-2">
          <Link href="/admin" className="link-ghost text-xs">
            Wejście dla gospodarza (admin)
          </Link>
        </footer>
      </header>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-blood/50 bg-blood/10 px-4 py-2 text-sm text-rose-200"
    >
      {message}
    </p>
  )
}

function Spinner({ light }: { light?: boolean }) {
  return <span className={light ? 'spinner-light' : 'spinner'} />
}
