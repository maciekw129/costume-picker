import type { Metadata } from 'next'
import { Nosifer, Nunito } from 'next/font/google'
import './globals.css'
import { HalloweenBackdrop } from '@/components/HalloweenBackdrop'

const nosifer = Nosifer({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nosifer',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Krypta Kostiumów',
  description:
    'Halloweenowa loteria kostiumów — podaj imię i wylosuj swój strój, zanim rozgarną go inne upiory.',
  other: {
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${nosifer.variable} ${nunito.variable}`}>
      <body className="font-body antialiased">
        <HalloweenBackdrop />
        <main className="relative z-10 flex min-h-dvh flex-col px-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
      </body>
    </html>
  )
}
