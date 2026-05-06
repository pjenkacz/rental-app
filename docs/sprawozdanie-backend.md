# Sprawozdanie techniczne — Backend

---

## 1. Wykorzystane technologie

| Technologia | Wersja / wariant | Rola |
|---|---|---|
| **Node.js** | v20 LTS | Środowisko uruchomieniowe JavaScript po stronie serwera |
| **Express** | v4 | Framework HTTP — obsługa żądań, routing, middleware |
| **TypeScript** | v5 | Statyczne typowanie — wykrywa błędy przed uruchomieniem |
| **PostgreSQL** | v15 (Docker lokalnie) | Relacyjna baza danych |
| **Drizzle ORM** | latest | Mapowanie obiektowo-relacyjne — zapytania SQL pisane w TypeScript zamiast surowego SQL |
| **Clerk** | `@clerk/express` | Autentykacja i zarządzanie użytkownikami jako usługa zewnętrzna |
| **Zod** | v3 | Walidacja danych wejściowych ze schematami TypeScript |
| **Uploadthing** | latest | Hosting plików graficznych jako usługa zewnętrzna |
| **Docker** | Compose | Izolowane środowisko lokalne z bazą danych |

---

## 2. Architektura — wzorzec Layered Architecture

Backend stosuje **Layered Architecture** (architektura warstwowa) — każda warstwa ma jedną odpowiedzialność i komunikuje się tylko z warstwą bezpośrednio poniżej. Żaden router nie dotyka bazy danych bezpośrednio; żaden serwis nie wie nic o HTTP.

```
Żądanie HTTP
     │
     ▼
┌──────────────┐
│   ROUTES     │  ← odbiera żądanie, wywołuje walidację, przekazuje do serwisu
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   SERVICES   │  ← logika biznesowa, operacje na danych
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  DB / SCHEMA │  ← Drizzle ORM, definicja tabel, zapytania do PostgreSQL
└──────────────┘
```

### Warstwa Routes (`src/routes/`)

**Co robi:** Przyjmuje żądanie HTTP, parsuje parametry (`req.query`, `req.body`, `req.params`), wywołuje odpowiedni serwis i odsyła odpowiedź JSON. Router nie zawiera żadnej logiki biznesowej.

**Benefit:** Zmiana sposobu komunikacji (np. REST → GraphQL) wymaga przepisania tylko routerów — serwisy pozostają nieruszone.

```typescript
// src/routes/lisitings.ts (fragment)

// requireAuth to middleware — zatrzymuje żądanie jeśli użytkownik nie jest zalogowany
router.get('/user/me', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);              // odczyt ID z tokenu Clerk

    // router nie wie jak działa filtrowanie — deleguje do serwisu
    const listings = await listingService.getByUserId(userId!);

    res.json({ data: listings });                 // odpowiedź JSON — jedyna odpowiedzialność routera
  } catch (err) {
    next(err);                                    // błąd trafia do globalnego errorHandler
  }
});
```

### Warstwa Services (`src/services/`)

**Co robi:** Zawiera całą logikę biznesową aplikacji — filtrowanie, paginację, soft-delete, operacje CRUD. Serwis wie *co* chce zrobić, ale nie wie *skąd* przyszło żądanie.

**Benefit:** Tę samą metodę `listingService.getAll()` można wywołać z routera HTTP, z CLI, z testu jednostkowego — bez zmian w kodzie serwisu.

```typescript
// src/services/listingService.ts (fragment)

export const listingService = {
  async getByUserId(userId: string) {
    // serwis operuje bezpośrednio na bazie przez Drizzle — bez wiedzy o HTTP
    const results = await db.query.listings.findMany({
      where: and(
        eq(listings.userId, userId),
        isNull(listings.deletedAt),   // soft-delete: pomijamy rekordy z datą usunięcia
      ),
      with: { images: true },         // Drizzle automatycznie dołącza powiązane zdjęcia (JOIN)
      orderBy: desc(listings.createdAt),
    });

    return results.map(mapListing);   // konwersja typów DB (string) → liczby dla klienta
  },

  async delete(id: string, userId: string) {
    // soft-delete: ustawiamy deletedAt zamiast fizycznie kasować rekord
    // dzięki temu dane można odzyskać i mamy historię
    const [deleted] = await db
      .update(listings)
      .set({ deletedAt: new Date() })
      .where(and(eq(listings.id, id), eq(listings.userId, userId)))
      .returning();
    return deleted;
  },
};
```

### Warstwa DB / Schema (`src/db/schema/`)

**Co robi:** Definiuje strukturę tabel w TypeScript przy użyciu Drizzle ORM. Typy są automatycznie inferowane ze schematu (`$inferSelect`, `$inferInsert`) — brak ręcznego pisania interfejsów.

**Benefit:** Zmiana kolumny w schemacie od razu generuje błąd TypeScript wszędzie, gdzie ta kolumna jest używana — kompilator wskazuje co trzeba zaktualizować.

```typescript
// src/db/schema/listings.ts (fragment)

// pgEnum tworzy typ enum bezpośrednio w PostgreSQL — baza odrzuca nieprawidłowe wartości
export const listingTypeEnum = pgEnum('listing_type', ['buy', 'rent']);

export const listings = pgTable('listings', {
  id:          uuid('id').defaultRandom().primaryKey(),  // UUID generowany przez DB, nie aplikację
  title:       text('title').notNull(),
  price:       numeric('price', { precision: 12, scale: 2 }).notNull(), // typ monetarny, 2 miejsca po przecinku
  listingType: listingTypeEnum('listing_type').notNull(),

  // soft-delete: null = rekord aktywny, timestamp = usunięty
  // zapytania zawsze filtrują WHERE deletedAt IS NULL
  deletedAt:   timestamp('deleted_at'),

  // FK z kaskadą: usunięcie użytkownika usuwa też jego ogłoszenia
  userId:      text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
});

// Drizzle inferuje typy bezpośrednio ze schematu — nie trzeba pisać interfejsów ręcznie
export type Listing    = typeof listings.$inferSelect;  // typ odczytu z bazy
export type NewListing = typeof listings.$inferInsert;  // typ zapisu do bazy
```

### Benefit całości

- **Testowalność** — każdą warstwę można testować w izolacji
- **Rozszerzalność** — nowa funkcjonalność to nowy plik w odpowiedniej warstwie, bez modyfikacji istniejących
- **Czytelność** — plik routera nie przekracza ~150 linii, bo logika żyje w serwisie

---

## 3. Warstwa walidacji — Zod (`src/validators/`)

**Zod** to biblioteka do definiowania schematów danych i ich walidacji w runtime. Schemat opisuje dokładnie jakie dane są akceptowane — typy, zakresy, wartości domyślne.

```typescript
// Przykład: walidacja ciała żądania POST /api/listings
export const createListingSchema = z.object({
  title: z.string().min(5),
  price: z.number().positive(),
  listingType: z.enum(['buy', 'rent']),
  latitude: z.number().min(-90).max(90),
  images: z.array(imageSchema).min(1),
});
```

**Co to oznacza w praktyce:** Zanim dane z `req.body` trafią do serwisu, Zod sprawdza każde pole. Jeśli cokolwiek się nie zgadza — router zwraca `400 Bad Request` z listą błędów, serwis nigdy nie jest wywoływany.

**Przed czym chroni:**

| Zagrożenie | Mechanizm ochrony |
|---|---|
| Brakujące wymagane pole | Schema wymaga pola — Zod rzuca błąd |
| Ujemna cena / błędne koordynaty | `.positive()`, `.min(-90).max(90)` |
| Nieznana wartość enuma | `.enum(['buy', 'rent'])` — inne wartości odrzucone |
| Zbyt duży limit paginacji | `.max(100)` — klient nie może wyciągnąć całej bazy |
| Wstrzyknięcie złego typu | Zod konwertuje lub odrzuca — `z.coerce.number()` dla query params |

**Benefit architektoniczny:** Walidatory są osobnymi plikami, niezależnymi od routerów i serwisów. Można je importować po stronie frontendu (współdzielone typy), używać w testach, lub podmienić na inną bibliotekę bez dotykania logiki biznesowej.

---

## 4. Middleware (`src/middleware/`)

**Middleware** (oprogramowanie pośredniczące) to funkcje wykonywane przez Express dla każdego żądania przed dotarciem do routera. Mają dostęp do `req`, `res` i funkcji `next()` — mogą przetworzyć żądanie, zakończyć je lub przekazać dalej.

### `requireAuth` — ochrona tras

```typescript
export const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req); // Clerk odczytuje token JWT z nagłówka
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  next(); // zalogowany — przepuść do routera
};
```

**Użycie:** `router.post('/', requireAuth, handler)` — middleware jest pierwszym argumentem, handler drugi. Niezalogowany użytkownik dostaje `401` zanim jego żądanie dotrze do jakiegokolwiek kodu biznesowego.

**Benefit:** Ochrona trasy to jedna linijka. Bez middleware każdy handler musiałby samodzielnie sprawdzać autentykację — ryzyko pominięcia przy dodawaniu nowych tras.

### `errorHandler` — centralna obsługa błędów

```typescript
export const errorHandler = (err, req, res, next) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Coś poszło nie tak',
  });
};
```

**Użycie:** Zarejestrowany jako ostatni w `index.ts` (`app.use(errorHandler)`). Każdy router wywołuje `next(err)` przy nieoczekiwanym błędzie — Express automatycznie przekazuje go do tego handlera.

**Benefit:** Jeden punkt obsługi błędów dla całej aplikacji. W środowisku developerskim zwraca szczegóły błędu; na produkcji — ogólny komunikat (nie ujawnia wewnętrznej implementacji).

---

## 5. Upload plików — Uploadthing (`src/uploadthing/`)

**Uploadthing** to zewnętrzna usługa hostingu plików. Pliki nigdy nie trafiają do bazy danych ani na dysk serwera — serwer jedynie konfiguruje reguły uploadu, a plik wędruje bezpośrednio do CDN Uploadthing.

### Flow

```
Przeglądarka użytkownika
        │
        │  1. żądanie o URL do uploadu (do naszego serwera)
        ▼
Nasz serwer (Uploadthing router)
        │  weryfikuje czy użytkownik jest zalogowany (Clerk)
        │  2. zwraca podpisany URL uploadu
        ▼
Przeglądarka użytkownika
        │
        │  3. upload pliku bezpośrednio do CDN Uploadthing
        ▼
   Uploadthing CDN
        │
        │  4. callback do naszego serwera: "plik załadowany, URL: ..."
        ▼
Nasz serwer
        │  5. URL zapisywany do PostgreSQL
        ▼
   Baza danych
```

**Konfiguracja reguł:**

| Endpoint | Limit plików | Limit rozmiaru | Dostęp |
|---|---|---|---|
| `listingImages` | 10 plików | 4 MB / plik | tylko zalogowani |
| `avatar` | 1 plik | 2 MB | tylko zalogowani |

**Benefity tego podejścia:**

- **Skalowalność** — serwer nie przetwarza plików, nie ma wąskiego gardła przy wielu uploadach jednocześnie
- **Bezpieczeństwo** — pliki nie są przechowywane lokalnie, brak ryzyka directory traversal
- **Prostota** — baza danych przechowuje tylko string URL, nie binarne dane
- **CDN** — pliki są serwowane z globalnej sieci, szybciej docierają do użytkownika niż z naszego serwera

---

## 6. Struktura plików — tabela referencyjna

```
server/
├── src/
│   ├── index.ts                        # punkt wejścia: rejestracja middleware i routerów
│   ├── db/
│   │   ├── index.ts                    # inicjalizacja połączenia z bazą (Drizzle + pg)
│   │   └── schema/
│   │       ├── index.ts                # re-export wszystkich schematów
│   │       ├── listings.ts             # tabela ogłoszeń + relacje + typy
│   │       ├── users.ts                # tabela użytkowników (sync z Clerk)
│   │       ├── images.ts               # tabela zdjęć ogłoszeń (1:N do listings)
│   │       ├── favorites.ts            # tabela ulubionych (M:N users ↔ listings)
│   │       └── conversations.ts        # tabela konwersacji i wiadomości
│   ├── middleware/
│   │   ├── auth.ts                     # requireAuth — weryfikacja tokenu Clerk
│   │   └── errorHandler.ts             # globalny handler błędów Express
│   ├── routes/
│   │   ├── lisitings.ts                # CRUD ogłoszeń + endpointy /map, /cities
│   │   ├── users.ts                    # profil użytkownika, aktualizacja danych
│   │   ├── favourites.ts               # dodawanie/usuwanie/listowanie ulubionych
│   │   ├── conversations.ts            # tworzenie i listowanie konwersacji + wiadomości
│   │   └── webhooks.ts                 # (legacy) Clerk webhook sync
│   ├── services/
│   │   ├── listingService.ts           # logika ogłoszeń: filtry, paginacja, soft-delete
│   │   ├── userService.ts              # upsert użytkownika, pobieranie profilu
│   │   ├── favouriteService.ts         # toggle ulubionych, sprawdzanie czy ulubione
│   │   └── conversationService.ts      # tworzenie konwersacji, wysyłanie wiadomości
│   ├── validators/
│   │   ├── listing.ts                  # Zod: createListing, updateListing, listingQuery, mapQuery
│   │   ├── conversation.ts             # Zod: createConversation
│   │   └── message.ts                  # Zod: sendMessage
│   └── uploadthing/
│       └── router.ts                   # konfiguracja endpointów uploadu (listingImages, avatar)
├── drizzle/
│   └── triggers.sql                    # SQL trigger: auto-update updated_at przy UPDATE
├── drizzle.config.ts                   # konfiguracja Drizzle Kit (migracje, połączenie)
├── Dockerfile.dev                      # obraz Docker dla środowiska deweloperskiego
└── .env.example                        # wzorzec zmiennych środowiskowych
```
