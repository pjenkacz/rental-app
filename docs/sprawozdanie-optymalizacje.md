# Sprawozdanie techniczne — Optymalizacje i bezpieczeństwo

---

## 1. Optymalizacja zapytań — TanStack Query

**TanStack Query** (dawniej React Query) to biblioteka do zarządzania stanem asynchronicznym po stronie klienta. Eliminuje ręczne pisanie `useEffect` + `useState` dla każdego żądania API i zastępuje je deklaratywnym cache'em.

### Cache oparty na queryKey

Każde zapytanie jest identyfikowane przez `queryKey` — tablicę wartości. TanStack Query traktuje identyczne klucze jako ten sam zasób i zwraca dane z pamięci podręcznej zamiast wysyłać kolejne żądanie HTTP.

```ts
// useListings.ts
export const useListings = (filters: ListingFilters = {}) => {
  return useQuery({
    queryKey: ['listings', filters],  // { city: 'Warszawa', minPrice: 1000 } → osobny wpis w cache
    queryFn: () => fetchListings(filters),
  });
};
```

Jeśli użytkownik przełącza filtry i wraca do poprzednich — dane są już w cache, brak oczekiwania na odpowiedź serwera. Każda unikalna kombinacja filtrów tworzy własny wpis.

### enabled — warunkowe fetchowanie

Hook nie wysyła żądania dopóki warunek `enabled` nie jest spełniony. Zapobiega to błędom z brakującymi parametrami i zbędnym żądaniom dla niezalogowanych użytkowników.

```ts
// useMessages.ts — nie odpytuj zanim nie wiadomo który conversationId
export const useMessages = (conversationId: string | undefined) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,   // false gdy undefined → żadne żądanie nie wychodzi
  });
};

// useUnreadCount.ts — badge z liczbą wiadomości tylko dla zalogowanych
export const useUnreadCount = () => {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    enabled: !!isSignedIn,       // niezalogowany nie widzi endpointu
    refetchInterval: 30_000,     // badge odświeżany co 30s bez klikania
  });
};
```

### refetchInterval — polling bez ręcznego setInterval

Zamiast pisać `setInterval` + `clearInterval` + obsługi błędów — `refetchInterval` automatycznie odpytuje endpoint w tle. TanStack Query zatrzymuje polling gdy karta przeglądarki jest nieaktywna (`refetchIntervalInBackground: false` to domyślne zachowanie) — nie marnuje zasobów gdy użytkownik ma aplikację w tle.

```ts
// useMessages.ts — Phase 1 przed refaktorem na socket.io
export const useMessages = (conversationId: string | undefined) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 4_000,   // nowe wiadomości co 4s — symuluje realtime przed WebSocketem
  });
};
```

### invalidateQueries po mutacji

Po wysłaniu wiadomości `useMutation` unieważnia dwa wpisy w cache — listę wiadomości i listę konwersacji (żeby `lastMessage` i timestamp się zaktualizowały). TanStack Query automatycznie odpyta invalidowane zasoby.

```ts
// useMessages.ts
export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage({ conversationId, content }),
    onSuccess: () => {
      // Unieważnij cache — TanStack Query sam refetchuje w tle
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
```


---

## 2. Bezpieczeństwo

### Autentykacja — Clerk + JWT

Clerk zarządza całym cyklem życia sesji użytkownika: logowanie, wylogowanie, odświeżanie tokenów. Backend **nie przechowuje haseł** ani tokenów sesji — weryfikuje tylko JWT wydany przez Clerk przy każdym żądaniu.

Token jest dołączany do każdego żądania przez interceptor Axios po stronie klienta. Serwer weryfikuje podpis tokenu przez SDK Clerk — nie ma endpointu logowania do zhakowania.

```ts
// apiClient.ts — interceptor request
apiClient.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken();                        // pobierz świeży JWT z Clerk
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Autoryzacja na poziomie zasobu

Samo bycie zalogowanym nie wystarczy — serwis sprawdza czy zalogowany użytkownik **jest właścicielem** zasobu który próbuje zmodyfikować. Warunek `userId` jest częścią zapytania `WHERE`, nie osobnym sprawdzeniem po pobraniu danych.

```ts
// listingService.ts — delete sprawdza jednocześnie istnienie i własność
async delete(id: string, userId: string) {
  const [deleted] = await db
    .update(listings)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(listings.id, id),
        eq(listings.userId, userId),  // nie twoje → 0 wierszy → router zwraca 404
        isNull(listings.deletedAt),
      )
    )
    .returning();
  return deleted; // null jeśli nie znaleziono lub brak uprawnień
}
```

### Izolacja konwersacji

Wiadomości konwersacji są dostępne tylko dla jej uczestników. Serwis weryfikuje czy `userId` jest `buyerId` lub `sellerId` — próba odpytania cudzej konwersacji zwraca `403 Forbidden`.

Dodatkowo: niemożliwe jest rozpoczęcie konwersacji z samym sobą — serwis sprawdza `buyerId !== sellerId` przed tworzeniem konwersacji.

### CORS — whitelist origin

Express przyjmuje żądania cross-origin tylko z adresu frontendu zdefiniowanego w zmiennej środowiskowej `CLIENT_URL`. Żądania z innych domen są odrzucane przez przeglądarkę na poziomie protokołu.

```ts
// index.ts
app.use(cors({ origin: process.env.CLIENT_URL })); // tylko nasz frontend może odpytywać API
```

### Walidacja wejścia — Zod (frontend + backend)

Zod waliduje dane **po obu stronach**: na frontendzie przed wysłaniem żądania (React Hook Form + `zodResolver`), na backendzie przed przekazaniem do serwisu. Nawet jeśli klient ominąłby walidację frontendu (np. przez Postman), backend i tak odrzuci niepoprawne dane z `400 Bad Request`.

### Soft-delete — brak fizycznego kasowania danych

Zamiast `DELETE FROM listings` aplikacja ustawia `deletedAt = now()`. Wszystkie zapytania filtrują `WHERE deletedAt IS NULL`. Dane są możliwe do odzyskania, a historia nie jest tracona. Właściciel ogłoszenia nie może nieodwracalnie zniszczyć danych które mogą być powiązane z konwersacjami innych użytkowników.

### Tajemnice w zmiennych środowiskowych

Żadne klucze API, dane dostępu do bazy ani sekrety Clerk nie są zakodowane na stałe w kodzie. Wszystkie wrażliwe wartości żyją w plikach `.env` wykluczonych z repozytorium przez `.gitignore`. Plik `.env.example` dokumentuje wymagane zmienne bez ujawniania wartości.

### Maskowanie błędów na produkcji

`errorHandler` zwraca pełny komunikat błędu tylko w środowisku deweloperskim (`NODE_ENV === 'development'`). Na produkcji klient widzi ogólne `"Coś poszło nie tak"` — stack trace i szczegóły implementacji nie wyciekają do przeglądarki.

---

## 3. Możliwości dalszego rozwoju

**Realtime — socket.io**
Zastąpienie pollingu (co 4s) połączeniem WebSocket. Wiadomości docierają natychmiastowo, obciążenie serwera spada — brak cyklicznych żądań od wszystkich aktywnych użytkowników jednocześnie.

**Wyszukiwanie pełnotekstowe**
PostgreSQL oferuje wbudowany `tsvector` / `tsquery` do wyszukiwania po tytule i opisie ogłoszenia z obsługą odmiany słów i rankingiem trafności — bez dodatkowej infrastruktury.

**Powiadomienia push**
Web Push API + service worker — użytkownik dostaje powiadomienie o nowej wiadomości nawet gdy karta jest zamknięta.

**Publiczny profil sprzedającego**
Strona `/users/:id` z avatarem, biogramem i aktywnymi ogłoszeniami danego użytkownika — dostępna bez logowania, zwiększa zaufanie kupujących.

**Waluty**
Pole `currency` w tabeli `listings` + helper `formatPrice(price, currency)` — obsługa PLN / EUR / USD bez zmian w logice biznesowej.

**Rate limiting**
`express-rate-limit`: globalny limit (~100 req/min) i osobny dla endpointów mutacji ochrona przed brute-force i nadmiernym obciążeniem API.

**Testy jednostkowe**
Vitest dla warstwy serwisów — `listingService.getAll()` z różnymi kombinacjami filtrów, walidatory Zod z nieprawidłowymi danymi. Niska inwestycja, wysoka wartość przy refaktorze.

**Deployment**
- Frontend → Vercel (auto-deploy z GitHub, CDN globalny)
- Backend → Railway (Node.js + Express, zero-config)
- Baza danych → Neon (serverless PostgreSQL, kompatybilny z Drizzle, darmowy tier)
