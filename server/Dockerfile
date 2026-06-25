# --- ETAP 1: Budowanie aplikacji ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Kompilujemy TypeScript do JavaScriptu (tworzy się folder dist)
RUN npm run build
# --- ETAP 2: Uruchamianie produkcyjne ---
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Instalujemy TYLKO zależności produkcyjne (pominie nodemon, tsx, typescript itp.)
# Zamiast: RUN npm ci --only=production
RUN npm ci --omit=dev
# Kopiujemy TYLKO skompilowany kod z pierwszego etapu (foldery dist i opcjonalnie jeśli potrzebujesz innych plików, ale dist to podstawa)
COPY --from=builder /app/dist ./dist
# Informujemy o porcie 
EXPOSE 3001
# Odpalamy czysty JavaScript
CMD ["npm", "start"]