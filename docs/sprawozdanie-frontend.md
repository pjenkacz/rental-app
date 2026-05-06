# Sprawozdanie techniczne — Frontend

---

## 1. Wykorzystane technologie

| Technologia | Wariant | Rola |
|---|---|---|
| **React** | v18, TypeScript | Biblioteka UI — komponenty funkcyjne, ścisłe typowanie |
| **Vite** | v5 | Bundler i dev server — szybki HMR, natywny ESM |
| **React Router DOM** | v6 | Routing po stronie klienta (SPA) |
| **SCSS** | Modules + global | Stylowanie — BEM, zmienne, mixiny, brak CSS-in-JS |
| **Clerk** | `@clerk/clerk-react` | Autentykacja — gotowe komponenty, hooki, bez ręcznego zarządzania stanem sesji |
| **React Hook Form** | v7 | Zarządzanie formularzami — walidacja per-krok, minimalny re-render |
| **Zod** | v3 | Schematy walidacji — te same reguły co backend, inferowane typy TypeScript |
| **Framer Motion** | v11 | Animacje przejść między krokami wizarda |
| **Leaflet / React Leaflet** | v4 | Interaktywna mapa ogłoszeń i podgląd lokalizacji |
| **Axios** | v1 | Klient HTTP — interceptory tokenu Clerk, globalna obsługa 401 |
| **Uploadthing** | `@uploadthing/react` | Komponent uploadu zdjęć zintegrowany z backendem |
| **Lucide React** | latest | Ikony — SVG, tree-shakeable, jednolity styl wizualny |

---

## 2. Responsywność — podejście mobile-first

Cały frontend stosuje strategię **mobile-first**: style bazowe pisane są dla najmniejszego ekranu, a breakpointy (`min-width`) rozszerzają układ dla większych urządzeń. Odwrotna kolejność — desktop-first z `max-width` — nie jest stosowana.

### System zmiennych i mixinów

Centralnym źródłem wartości designu jest `src/styles/_variables.scss` — jeden plik definiuje breakpointy, kolory, odstępy, typografię i cienie. Każdy komponent importuje go przez `@use` i nigdy nie definiuje własnych wartości pixel-by-pixel.

```scss
/* src/styles/_variables.scss — fragment */
$bp-sm:  480px;   // duże telefony
$bp-md:  768px;   // tablety / telefon poziomo
$bp-lg:  1024px;  // małe laptopy
$bp-xl:  1280px;  // desktop

$color-accent:     #D97558;   // terracotta — CTA, focus, progress bar
$color-text-muted: #78716C;   // szary — labele, opisy pomocnicze
$spacing-md:       16px;
$navbar-height:    70px;      // mobile; nadpisywany na md i xl
```

Plik `src/styles/_mixins.scss` opakowuje każdy breakpoint w nazwany mixin, co eliminuje literówki w wartościach `min-width` i ujednolica zapis w całym projekcie.

```scss
/* src/styles/_mixins.scss */
@mixin bp-md {
  @media (min-width: $bp-md) { @content; }
}

/* Użycie w komponencie — zawsze mobile base, potem rozszerzenie */
.listingsGrid {
  display: grid;
  grid-template-columns: 1fr;           // mobile: 1 kolumna

  @include bp-md {
    grid-template-columns: repeat(2, 1fr);
  }

  @include bp-xl {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Benefity tego podejścia:**
- Zmiana wartości breakpointu w jednym pliku propaguje się przez cały projekt
- Brak możliwości pomyłki w wartości `min-width` — mixin weryfikuje kompilator SCSS
- Kod komponentu opisuje intencję (`bp-md`) zamiast magicznych liczb (`768px`)
- Nowy developer widzi od razu że projekt jest mobile-first — konwencja jest widoczna

---

## 3. Routing — struktura i ochrona tras

Aplikacja używa **React Router v6** w trybie `createBrowserRouter` — każda sekcja ma własny URL, bez ukrytego stanu w modalu czy lokalnych zmiennych. Użytkownik może wkleić dowolny URL i trafić bezpośrednio w to samo miejsce (deep linking).

### Drzewo routingu

```
/                          → HomePage          (hero, najnowsze oferty, sekcje informacyjne)
/listings                  → ListPage          (siatka kart + filtry + mapa Leaflet)
/listings/:id              → SinglePage        (zdjęcia, szczegóły, przycisk kontaktu)
/about                     → AboutPage         (informacje o platformie)

── chronione (ProtectedRoute) ──────────────────────────────────────────────────
/listings/new              → NewListingPage    (wizard 5-krokowy)
/listings/:id/edit         → EditListingPage   (edycja istniejącego ogłoszenia)
/messages                  → MessagesPage      (lista konwersacji)
/messages/:conversationId  → MessagesPage      (konkretna rozmowa)
/profile                   → ProfileLayout > ProfileOverviewPage
/profile/listings          → ProfileLayout > ProfileListingsPage
/profile/saved             → ProfileLayout > ProfileSavedPage
/profile/settings          → ProfileLayout > ProfileSettingsPage
*                          → NotFoundPage      (catch-all 404)
```

### ProtectedRoute — ochrona tras bez kodu boilerplate

`ProtectedRoute` to komponent opakowujący grupy tras wymagających zalogowania. Używa hooka `useAuth()` z Clerk — jeśli użytkownik nie jest zalogowany, Clerk wyświetla ekran logowania zamiast chronionej treści. Jeśli jest zalogowany — renderuje `<Outlet />`, czyli zagnieżdżoną trasę.

```tsx
// src/components/auth/ProtectedRoute.tsx
const ProtectedRoute: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;                  // Clerk jeszcze ładuje token — nie renderuj nic

  if (!isSignedIn) return <RedirectToSignIn />; // niezalogowany → przekierowanie Clerk

  return <Outlet />;                           // zalogowany → renderuj trasę potomną
};
```

W `App.tsx` jedna instancja `ProtectedRoute` chroni całą grupę tras — nie trzeba dodawać sprawdzenia do każdego komponentu strony z osobna.

### Trasy proste

**`/`  — HomePage** — strona główna z sekcją hero, paskiem wyszukiwania z filtrami (typ ogłoszenia, cena, liczba pokoi), siatką najnowszych ogłoszeń pobieranych z API, sekcją „Dlaczego my?" i stopką.

**`/listings` — ListPage** — widok przeglądania: siatka kart ogłoszeń po lewej, interaktywna mapa Leaflet po prawej. Filtry w pasku nad listą aktualizują oba panele jednocześnie.

**`/listings/:id` — SinglePage** — szczegóły ogłoszenia: galeria zdjęć, parametry, lokalizacja na mapie, przyciski „Ulubione" i „Wyślij wiadomość" z obsługą stanu autentykacji.

**`/about` — AboutPage** — strona informacyjna o platformie.

---

## 4. Moduł profilu użytkownika (`/profile/*`)

### Architektura — wzorzec Layout + Outlet

Moduł profilu jest zbudowany na wzorcu **Shared Layout** z React Router: `ProfileLayout` to trwały kontener (nagłówek + pasek zakładek), który zawsze jest widoczny niezależnie od aktywnej zakładki. Zmienia się tylko zawartość renderowana przez `<Outlet />` — czyli aktywna pod-strona.

```
┌────────────────────────────────────────────┐
│  ProfileLayout (trwały)                    │
│  ┌──────────────────────────────────────┐  │
│  │  Nagłówek: avatar, imię, statystyki  │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Tab bar: Overview | Listings | ...  │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  <Outlet /> — zmienia się per zakładka│  │
│  │  ┌────────────────────────────────┐  │  │
│  │  │  ProfileOverviewPage           │  │  │
│  │  │  ProfileListingsPage           │  │  │
│  │  │  ProfileSavedPage              │  │  │
│  │  │  ProfileSettingsPage           │  │  │
│  │  └────────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### Pasek zakładek i nawigacja

Zakładki używają komponentu `NavLink` z React Router, który automatycznie dodaje klasę CSS `active` do aktywnej zakładki — bez ręcznego porównywania URL. Zakładka „Messages →" celowo przekierowuje poza moduł profilu do `/messages`, co sygnalizuje użytkownikowi że wchodzi w inną sekcję aplikacji.

```tsx
// src/routes/profilePage/ProfileLayout.tsx (fragment)
<NavLink
  to="/profile"
  end  // "end" wymusza dokładne dopasowanie — bez tego /profile/listings też byłoby "active"
  className={({ isActive }) => `profileTab${isActive ? ' profileTab--active' : ''}`}
>
  Overview
</NavLink>

<NavLink to="/messages" className="profileTab profileTab--external">
  Messages →   {/* strzałka sygnalizuje wyjście z modułu profilu */}
</NavLink>
```

### Dane użytkownika z Clerk

`ProfileLayout` pobiera dane użytkownika bezpośrednio przez hook `useUser()` z Clerk — imię, email, avatar URL. Nie ma osobnego endpointu API do pobierania podstawowych danych profilu; Clerk jest źródłem prawdy dla tożsamości użytkownika.

### Wpływ na UX

Trwały header z avatarem i statystykami nadaje każdej zakładce kontekst — użytkownik zawsze wie czyj profil przegląda. Zmiana zakładki nie przeładowuje strony, tylko podmienia `<Outlet />`, co eliminuje migotanie i utratę pozycji scrolla na headerze. URL zmienia się przy każdej zakładce, więc można udostępnić link do konkretnej pod-strony profilu.

---

## 5. Wizard dodawania ogłoszenia (`/listings/new`)

### Opis działania

Tworzenie ogłoszenia jest podzielone na 5 kroków. Użytkownik widzi jeden krok na raz, a pasek postępu u góry pokazuje który krok jest aktywny i które zostały już odwiedzone (na odwiedzone można kliknąć i wrócić).

```
Krok 1 — Podstawowe info    tytuł, typ ogłoszenia (wynajem/sprzedaż), typ nieruchomości, cena, opis
Krok 2 — Szczegóły          liczba pokoi, łazienek, powierzchnia m², piętro, udogodnienia (checkboxy)
Krok 3 — Lokalizacja        adres, miasto, weryfikacja współrzędnych przez Nominatim (geocoding)
Krok 4 — Zdjęcia            upload przez Uploadthing, drag-and-drop, min. 1 zdjęcie wymagane
Krok 5 — Podgląd            read-only podsumowanie przed publikacją, przycisk „Publikuj"
```

Walidacja odbywa się **per krok** — próba przejścia do następnego kroku z błędami w polach pokazuje komunikaty bezpośrednio przy polach i nie przepuszcza dalej. Dopiero po poprawnym wypełnieniu wszystkich pól danego kroku przycisk „Dalej" działa.

Dane formularza są automatycznie zapisywane do `localStorage` przy każdym przejściu między krokami. Jeśli użytkownik zamknie przeglądarkę lub odejdzie ze strony, przy kolejnym wejściu zobaczy modal z pytaniem czy kontynuować poprzedni szkic. Próba opuszczenia strony z niezapisanymi zmianami (np. kliknięcie w link w navbarze) wyświetla modal blokujący nawigację z trzema opcjami: wyjdź bez zapisywania, zostań, zapisz szkic i wyjdź.

Po kliknięciu „Publikuj" na kroku 5 dane są wysyłane do API, szkic jest czyszczony z `localStorage`, a użytkownik po odliczaniu jest przekierowywany na stronę nowo utworzonego ogłoszenia.

### Strona techniczna

**Formularz — React Hook Form + Zod**

Jeden formularz (`useForm`) obejmuje wszystkie 5 kroków. `FormProvider` opakowuje cały wizard i udostępnia kontekst formularza każdemu komponentowi kroku przez hook `useFormContext` — bez przekazywania propsów przez wiele poziomów.

```tsx
// NewListingPage.tsx — inicjalizacja formularza
const methods = useForm<WizardFormData>({
  resolver: zodResolver(wizardSchema),  // Zod waliduje cały formularz
  mode: 'onTouched',                    // błąd pojawia się dopiero po opuszczeniu pola
  reValidateMode: 'onChange',           // po pierwszym błędzie walidacja na bieżąco
  defaultValues: {
    listingType: 'rent',
    propertyType: 'apartment',
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    country: 'Polska',
  },
});

// FormProvider udostępnia kontekst kroku 1, 2, 3... bez prop drillingu
return (
  <FormProvider {...methods}>
    {renderStep()}
  </FormProvider>
);
```

**Walidacja per krok**

`STEP_FIELDS` mapuje numer kroku na listę pól które należą do tego kroku. Przed przejściem dalej wywoływane jest `methods.trigger(stepFields)` — waliduje tylko pola aktualnego kroku, nie całego formularza.

```tsx
// wizardTypes.ts — mapowanie krok → pola
export const STEP_FIELDS: Record<number, (keyof WizardFormData)[]> = {
  0: ['title', 'listingType', 'propertyType', 'price', 'description'],
  1: ['bedrooms', 'bathrooms', 'area', 'amenities'],
  2: ['address', 'city', 'country', 'latitude', 'longitude'],
  3: [],  // krok zdjęć — walidacja oddzielna (sprawdza tablicę images)
  4: [],  // podgląd — brak pól formularza
};

// NewListingPage.tsx — handleNext (fragment)
const handleNext = async () => {
  const stepFields = STEP_FIELDS[currentStep];

  // trigger() waliduje tylko pola bieżącego kroku i zwraca boolean
  const valid = await methods.trigger(stepFields as (keyof WizardFormData)[]);
  if (!valid) return;  // zostań na kroku, błędy już widoczne przy polach

  // Krok 3 — dodatkowe sprawdzenie geocodingu (latitude/longitude muszą być ustawione)
  if (currentStep === 2) {
    const lat = methods.getValues('latitude');
    const lng = methods.getValues('longitude');
    if (!lat || !lng) {
      methods.setError('address', { message: 'Wpisz adres i poczekaj na weryfikację lokalizacji' });
      return;
    }
  }

  // Krok 4 — co najmniej 1 zdjęcie musi być załadowane pomyślnie
  if (currentStep === 3) {
    const successImages = images.filter((img) => img.status === 'success');
    if (successImages.length === 0) {
      setPhotosError('Dodaj co najmniej 1 zdjęcie przed przejściem dalej');
      return;
    }
  }

  saveDraft(methods.getValues(), images, currentStep + 1);  // autozapis do localStorage
  setCurrentStep(prev => prev + 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**Auto-save draftu — `useWizardDraft`**

Hook `useWizardDraft` hermetyzuje całą logikę zapisu/odczytu szkicu w `localStorage`. Zapisuje tylko zdjęcia ze statusem `'success'` (zignorowane te w trakcie uploadu lub z błędem), żeby po odtworzeniu szkicu nie było martwych referencji.

```tsx
// useWizardDraft.ts (fragment)
const DRAFT_KEY = 'listing-wizard-draft';

export const useWizardDraft = () => {
  const saveDraft = useCallback((formData, images, currentStep) => {
    const draft = {
      formData,
      images: images.filter(img => img.status === 'success'), // tylko pomyślne uploady
      currentStep,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, []);

  const hasDraft = useCallback(() => !!localStorage.getItem(DRAFT_KEY), []);

  // ...loadDraft, clearDraft analogicznie
};
```

**Blokada nawigacji — `useBlocker`**

React Router v6 udostępnia hook `useBlocker` — przechwytuje próbę opuszczenia strony zanim faktycznie nastąpi zmiana URL. Bloker jest aktywny tylko gdy `isDirty` jest `true` (użytkownik zaczął wypełniać formularz).

```tsx
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname
);

// blocker.state === 'blocked' → pokazuj modal z opcjami
// blocker.proceed() → kontynuuj nawigację
// blocker.reset()   → anuluj, zostań na stronie
```

**Animacje przejść — Framer Motion**

Każdy krok jest opakowany w `<motion.div>` z `AnimatePresence`. Wejście kroku animuje się przez `opacity + translateY`, wyjście przez `opacity + translateY` w górę — daje wizualne poczucie nawigacji „w przód".

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}           // zmiana key wymusza unmount/mount — AnimatePresence to animuje
    variants={stepVariants}     // hidden / visible / exit
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.28, ease: 'easeOut' }}
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

**Benefity całego podejścia wizarda:**
- Jeden formularz dla 5 kroków — dane nie są tracone przy cofaniu się
- Walidacja per krok — użytkownik nie widzi błędów z kroków których jeszcze nie wypełniał
- Auto-save do `localStorage` — utrata połączenia lub zamknięcie karty nie kasuje pracy
- Blokada nawigacji — niemożliwe przypadkowe wyjście bez ostrzeżenia
- Animacje przejść — budują poczucie sekwencji i kierunku bez dodatkowej logiki stanu
