# Krypta Kostiumów

Halloweenowa loteria kostiumów — podaj imię i wylosuj swój strój, zanim rozgarną go inne upiory.

## Jak to działa

1. **Admin** (Ty) wchodzi na `/admin`, podaje hasło i dodaje kostiumy do puli
2. **Goście** wchodzą na `/`, wpisują unikalne imię, klikają „Otwórz kopertę" i dostają losowy kostium
3. Każdy kostium przydzielany jest tylko raz (atomowo, bezpieczne przy równoczesnych losowaniach)
4. Gość może wrócić i podać imię, żeby zobaczyć swój kostium (nie widzi cudzych)

## Uruchomienie lokalne

```bash
# 1. Skopiuj zmienne środowiskowe
cp .env.example .env

# 2. (Opcjonalnie) Uruchom lokalny Postgres w Dockerze
docker run -d --name costume-db \
  -e POSTGRES_USER=costume \
  -e POSTGRES_PASSWORD=costume \
  -e POSTGRES_DB=costume_picker \
  -p 5433:5432 \
  postgres:16-alpine

# Zaktualizuj DATABASE_URL w .env:
# DATABASE_URL="postgresql://costume:costume@localhost:5433/costume_picker?schema=public"

# 3. Zainstaluj zależności i uruchom migracje
npm install
npm run db:migrate

# 4. Start dev server
npm run dev
```

Otwórz http://localhost:3000

## Deployment na Vercel + Neon

### 1. Stwórz bazę Neon

1. Wejdź na https://neon.com i zaloguj się
2. Kliknij „Create a project" → nazwij np. `costume-picker`
3. Po utworzeniu skopiuj **Pooled connection string** (ma `-pooler` w hoście)

### 2. Skonfiguruj Vercel

1. Wypchnij repo na GitHub
2. Wejdź na https://vercel.com/new i zaimportuj repo
3. W sekcji „Environment Variables" dodaj:
   - `DATABASE_URL` = `<Neon pooled connection string>`
   - `ADMIN_PASSCODE` = `<Twoje silne hasło do admina>`

4. Kliknij „Deploy"

### 3. Gotowe

- Aplikacja: `https://twoja-app.vercel.app`
- Admin: `https://twoja-app.vercel.app/admin`

## Zmienne środowiskowe

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `DATABASE_URL` | Connection string do Postgres (Neon: użyj pooled) | `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` |
| `ADMIN_PASSCODE` | Hasło do panelu admina | `moje-tajne-haslo-2026` |

## Komendy

```bash
npm run dev        # Development server
npm run build      # Build produkcyjny (z migracjami)
npm run start      # Start produkcyjny
npm run db:migrate # Uruchom migracje lokalnie
npm run db:studio  # Otwórz Prisma Studio (GUI do bazy)
```

## Struktura

```
src/
├── app/
│   ├── page.tsx          # Strona główna (gość)
│   ├── layout.tsx        # Layout z fontami i tłem
│   ├── globals.css       # Halloween styling
│   └── admin/
│       └── page.tsx      # Panel admina
├── components/
│   ├── GuestFlow.tsx     # Ścieżka gościa (imię → koperta → wynik)
│   ├── AdminPanel.tsx    # Dashboard admina
│   └── HalloweenBackdrop.tsx  # Dekoracje (nietoperze, mgła, księżyc)
└── lib/
    ├── prisma.ts         # Klient Prisma z adapterem pg
    ├── draw.ts           # Logika atomowego losowania
    ├── admin.ts          # Autoryzacja admina (cookie)
    └── names.ts          # Normalizacja imion

prisma/
├── schema.prisma         # Model danych (Person, Costume)
└── migrations/           # Migracje
```

## Bezpieczeństwo

- Hasło admina haszowane (SHA-256), porównywane z timing-safe equal
- Cookie admina: `httpOnly`, `sameSite=lax`, `secure` na produkcji
- Brak uploadu plików — obrazki to tylko linki URL (opcjonalne)
- Losowanie atomowe (`FOR UPDATE SKIP LOCKED`) — bezpieczne przy concurrency
