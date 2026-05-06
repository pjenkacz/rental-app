# Deploy Checklist — majkelovsky

## ✅ Zrobione
- [x] Wygenerowane pliki migracji Drizzle (`server/drizzle/0000_mixed_nighthawk.sql`)
- [x] Dodane skrypty `db:generate` i `db:migrate` do `server/package.json`
- [x] Produkcyjny `server/Dockerfile` (multi-stage build)
- [x] `server/start.sh` (entrypoint: migracja → start serwera)

---

## Krok 3 — Zewnętrzne serwisy (ręcznie)

### Neon DB
- [ ] Załóż konto na https://neon.tech
- [ ] Stwórz projekt → skopiuj `DATABASE_URL`
  - Format: `postgresql://user:pass@host/dbname?sslmode=require`

### Clerk Production Instance
- [ ] Clerk Dashboard → "Create application" → typ **Production**
- [ ] Dodaj domenę: `majkelovsky.vercel.app`
- [ ] Skopiuj `CLERK_SECRET_KEY` (`sk_live_...`) i `CLERK_PUBLISHABLE_KEY` (`pk_live_...`)
- [ ] **Po deploycie backendu:** Webhooks → Add endpoint:
  - URL: `https://majkelovsky-api.onrender.com/api/webhooks/clerk`
  - Events: `user.created`, `user.updated`
  - Skopiuj `CLERK_WEBHOOK_SECRET`

### Uploadthing
- [ ] Załóż konto na https://uploadthing.com
- [ ] Stwórz aplikację → skopiuj `UPLOADTHING_SECRET` i `UPLOADTHING_APP_ID`
- [ ] Settings → Allowed Origins → dodaj `https://majkelovsky.vercel.app`

---

## Krok 4 — Deploy backendu na Render

- [ ] Render Dashboard → **New Web Service** → połącz GitHub repo
- [ ] Root Directory: `server`
- [ ] Environment: **Docker**
- [ ] Port: `3001`
- [ ] Wklej env vars:
  ```
  DATABASE_URL=postgresql://...
  CLERK_SECRET_KEY=sk_live_...
  CLERK_PUBLISHABLE_KEY=pk_live_...
  CLERK_WEBHOOK_SECRET=whsec_...
  UPLOADTHING_SECRET=sk_...
  UPLOADTHING_APP_ID=...
  CLIENT_URL=https://majkelovsky.vercel.app
  PORT=3001
  NODE_ENV=production
  ```
- [ ] Zweryfikuj: `GET https://majkelovsky-api.onrender.com/api/health` → `200 OK`

---

## Krok 5 — Deploy frontendu na Vercel

- [ ] Vercel Dashboard → **New Project** → połącz GitHub repo
- [ ] Root Directory: `client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Wklej env vars:
  ```
  VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
  VITE_API_URL=https://majkelovsky-api.onrender.com
  UPLOADTHING_TOKEN=...
  ```

---

## Krok 6 — Cleanup kodu przed deployem

- [ ] Usunąć `console.log(CLERK_KEY)` z `client/src/main.tsx`
- [ ] Sprawdzić `.gitignore`: `.env` i `.env.local` są ignorowane
- [ ] Sprawdzić że `server/drizzle/` **NIE jest** w `.gitignore`

---

## Weryfikacja końcowa
1. `GET https://majkelovsky-api.onrender.com/api/health` → `200 OK`
2. Strona Vercel ładuje się, Clerk sign-in działa
3. Stwórz ogłoszenie — zdjęcie uploaduje się przez Uploadthing
4. Wyślij wiadomość między dwoma kontami — konwersacja działa
