# 🏠 Rental App

Full-stack real estate marketplace built with React + TypeScript + Express + PostgreSQL.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, SCSS, TanStack Query, Clerk Auth  
**Backend:** Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL (Neon)

## Prerequisites

- Node.js 18+
- npm 9+
- Konta na: [Neon.tech](https://neon.tech), [Clerk](https://clerk.com)

## Setup

### 1. Klonuj repo
```bash
git clone https://github.com/pjenkacz/rental-app.git
cd rental-app
```

### 2. Setup backendu
```bash
cd server
npm install
cp .env.example .env
```

Uzupełnij `.env` swoimi kluczami (Neon, Clerk).
```bash
npm run db:push    # utwórz tabele w bazie
npm run dev        # odpal serwer na localhost:3001
```

### 3. Setup frontendu
```bash
cd client
npm install
cp .env.example .env
```

Uzupełnij `.env` kluczem Clerk (`VITE_CLERK_PUBLISHABLE_KEY`).
```bash
npm run dev        # odpal frontend na localhost:5173
```

### 4. Odpal oba serwery
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2  
cd client && npm run dev
```

Otwórz [http://localhost:5173](http://localhost:5173)

## Project Structure
```
rental-app/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── routes/
│       └── lib/
└── server/          # Express backend
    └── src/
        ├── db/
        ├── middleware/
        ├── routes/
        └── services/
```
