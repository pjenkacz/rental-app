# 🏠 Rental App – Dokument wprowadzający dla nowego członka zespołu

---

## Czym jest ten projekt?

Budujemy **platformę do wynajmu i sprzedaży nieruchomości** – coś w stylu uproszczonego OLX/Airbnb dla mieszkań. Użytkownik może przeglądać oferty, filtrować je po mieście i cenie, zapisywać ulubione oraz kontaktować się z ogłoszeniodawcą przez wbudowany czat.

Projekt jest budowany od zera jako **portfolio produkcyjnej jakości** – z prawdziwą bazą danych, autentykacją, REST API i nowoczesnym frontendem.

---

## Stack technologiczny

| Warstwa | Technologia | Po co? |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | UI aplikacji |
| Stylowanie | SCSS + własny design system | Wygląd |
| Routing | React Router DOM | Nawigacja między stronami |
| Stan serwera | TanStack Query | Pobieranie i cachowanie danych z API |
| Autentykacja | Clerk | Logowanie, rejestracja, sesje |
| Backend | Node.js + Express + TypeScript | REST API |
| Baza danych | PostgreSQL na Neon.tech | Przechowywanie danych |
| ORM | Drizzle ORM | Komunikacja z bazą przez TypeScript |
| Upload zdjęć | UploadThing | Przechowywanie zdjęć mieszkań |

---

## Struktura projektu

```
rental-app/
├── client/          ← Frontend (React + Vite)
└── server/          ← Backend (Express + Node.js)
```

Frontend i backend to **dwa osobne projekty** działające na osobnych portach.  
Uruchamiasz je równolegle w dwóch terminalach.

---

## Szczegółowa struktura – Frontend (`client/`)

```
client/src/
├── components/               ← Komponenty wielokrotnego użytku
│   ├── navbar/               ← Pasek nawigacji (logo, linki, auth)
│   ├── searchBar/            ← Wyszukiwarka (miasto, cena, typ)
│   ├── card/                 ← Karta pojedynczej oferty na liście
│   ├── list/                 ← Lista kart ofert
│   ├── slider/               ← Galeria zdjęć na stronie oferty
│   ├── chat/                 ← Komponent czatu (UI)
│   ├── map/                  ← Mapa Leaflet z pinami ofert
│   └── pin/                  ← Pin na mapie dla pojedynczej oferty
│
├── routes/                   ← Strony aplikacji (1 folder = 1 strona)
│   ├── homePage/             ← Strona główna z hero i wyszukiwarką
│   ├── listPage/             ← Lista ofert + mapa obok
│   ├── singlePage/           ← Szczegóły jednej oferty
│   ├── loginPage/            ← Strona logowania (Clerk SignIn)
│   ├── registerPage/         ← Strona rejestracji (Clerk SignUp)
│   ├── profilePage/          ← Profil użytkownika
│   └── layout/               ← Wrapper z Navbar (wspólny dla wszystkich stron)
│
├── lib/                      ← Logika pomocnicza
│   └── hooks/                ← Custom hooks TanStack Query (pobieranie danych)
│
├── App.tsx                   ← Definicja routingu całej aplikacji
├── main.tsx                  ← Punkt wejścia: Clerk + TanStack Query + App
├── index.scss                ← Globalne style (fonty, reset CSS)
└── responsive.scss           ← Mixiny SCSS do breakpointów (sm/md/lg)
```

---

## Szczegółowa struktura – Backend (`server/`)

```
server/src/
├── db/
│   ├── index.ts              ← Połączenie z bazą Neon przez Drizzle
│   └── schema/               ← Definicje tabel bazy danych
│       ├── users.ts          ← Tabela użytkowników (id z Clerk, email, rola)
│       ├── listings.ts       ← Tabela ofert (tytuł, cena, lokalizacja, typ)
│       ├── images.ts         ← Tabela zdjęć powiązanych z ofertami
│       ├── favorites.ts      ← Tabela ulubionych (user + listing)
│       └── index.ts          ← Re-export wszystkich tabel
│
├── middleware/
│   ├── auth.ts               ← requireAuth: blokuje endpoint dla niezalogowanych
│   └── errorHandler.ts       ← Globalny handler błędów (zamiast try/catch wszędzie)
│
├── services/                 ← Logika biznesowa (zapytania do bazy)
│   ├── listingService.ts     ← CRUD dla ofert + filtrowanie
│   ├── userService.ts        ← Pobieranie i tworzenie użytkowników
│   └── favoriteService.ts    ← Dodawanie/usuwanie/pobieranie ulubionych
│
├── routes/                   ← Definicje endpointów HTTP
│   ├── listings.ts           ← GET/POST/PUT/DELETE /api/listings
│   ├── users.ts              ← GET /api/users/me
│   ├── favorites.ts          ← GET/POST/DELETE /api/favorites
│   └── upload.ts             ← POST /api/upload (zdjęcia)
│
└── index.ts                  ← Serce serwera: Express app, middleware, routing
```

---

## Baza danych – tabele

| Tabela | Co przechowuje |
|---|---|
| `users` | Użytkownicy synchronizowani z Clerk (id, email, rola: client/agent/admin) |
| `listings` | Oferty nieruchomości (tytuł, cena, lokalizacja, typ: buy/rent) |
| `listing_images` | Zdjęcia powiązane z ofertami (url, kolejność) |
| `favorites` | Pary user+listing (kto co dodał do ulubionych) |

---

## Dostępne endpointy API

| Metoda | Endpoint | Auth? | Co robi? |
|---|---|---|---|
| GET | `/api/health` | ❌ | Sprawdzenie czy serwer żyje |
| GET | `/api/listings` | ❌ | Lista ofert (filtry: city, minPrice, maxPrice, type) |
| GET | `/api/listings/:id` | ❌ | Szczegóły jednej oferty |
| POST | `/api/listings` | ✅ | Dodaj nową ofertę |
| PUT | `/api/listings/:id` | ✅ | Edytuj ofertę (tylko właściciel) |
| DELETE | `/api/listings/:id` | ✅ | Usuń ofertę (tylko właściciel) |
| GET | `/api/users/me` | ✅ | Dane zalogowanego użytkownika |
| GET | `/api/favorites` | ✅ | Ulubione zalogowanego użytkownika |
| POST | `/api/favorites/:listingId` | ✅ | Dodaj do ulubionych |
| DELETE | `/api/favorites/:listingId` | ✅ | Usuń z ulubionych |

---

## Co zostało już zrobione

- ✅ część frontend – komponenty, strony, nawigacja, SCSS design system
- ✅ Konfiguracja Vite z TypeScript i aliasami ścieżek (`@/`)
- ✅ Backend Express z TypeScript – struktura, middleware, routing
- ✅ Połączenie z bazą PostgreSQL na Neon.tech
- ✅ Schema Drizzle – 4 tabele zsynchronizowane z bazą (`npm run db:push`)
- ✅ Services layer – cała logika CRUD
- ✅ Repozytorium GitHub z `.gitignore` i plikami `.env.example`

## Co jest do zrobienia
  ✅ Integracja Clerk – strony logowania i rejestracji działają
- ✅ Navbar reaguje na stan zalogowania (avatar użytkownika lub linki Sign In/Up) 
- ✅ Wszystkie endpointy REST API z walidacją (Zod) i autoryzacją (Clerk)
- ⬜ Podłączenie frontendu do API (TanStack Query hooks zamiast dummy data)
- ⬜ Upload zdjęć przez UploadThing
- ⬜ Webhook Clerk → synchronizacja użytkowników do naszej bazy
- ⬜ Strona profilu użytkownika z jego ofertami i ulubionymi
- ⬜ Mapa z prawdziwymi danymi z bazy
- ⬜ Formularz dodawania nowej oferty

---

## Jak uruchomić projekt lokalnie

### Wymagania
- Node.js 18+
- Konta na: Neon.tech, Clerk.com

### Kroki

```bash
# 1. Klonuj repo
git clone https://github.com/USERNAME/rental-app.git
cd rental-app

# 2. Setup backendu
cd server
npm install
cp .env.example .env
# → uzupełnij .env swoimi kluczami (Neon, Clerk)
npm run db:push
npm run dev       # serwer na localhost:3001

# 3. Setup frontendu (nowy terminal)
cd client
npm install
cp .env.example .env
# → uzupełnij VITE_CLERK_PUBLISHABLE_KEY
npm run dev       # frontend na localhost:5173
```

### Zmienne środowiskowe

**`server/.env`** – potrzebujesz od właściciela projektu lub tworzysz własne:
- `DATABASE_URL` – connection string z Neon.tech
- `CLERK_SECRET_KEY` – z dashboardu Clerk (zakładka API Keys)
- `PORT=3001`
- `CLIENT_URL=http://localhost:5173`

**`client/.env`** – tylko jeden klucz:
- `VITE_CLERK_PUBLISHABLE_KEY` – z dashboardu Clerk (zaczyna się od `pk_test_`)
- `VITE_API_URL=http://localhost:3001`

---

## Konwencje w projekcie

- **TypeScript wszędzie** – żadnych plików `.js` ani `.jsx`
- **Jeden folder = jeden komponent/strona** – plik `.tsx` + plik `.scss` razem
- **Services layer** – logika bazy danych nigdy nie trafia bezpośrednio do routerów
- **SCSS zamiast CSS-in-JS** – stylowanie przez pliki `.scss` z `@use '@/responsive'`
- **Konwencja nazewnictwa** – komponenty `PascalCase`, pliki `camelCase`

---

*Dokument wygenerowany: marzec 2026*1