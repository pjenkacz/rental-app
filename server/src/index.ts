import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { clerkMiddleware } from '@clerk/express';
import { db } from './db';
import { users } from './db/schema';
import listingsRouter from './routes/lisitings';
import usersRouter from './routes/users';
import favoritesRouter from './routes/favourites';
//import uploadRouter from './routes/upload';
import { errorHandler } from './middleware/errorHandler';



const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use('/api/listings', listingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/favorites', favoritesRouter);
//app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

//app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

db.select().from(users).limit(1)
  .then(() => console.log('✅ Baza danych połączona!!'))
  .catch((err) => console.error('❌ Błąd bazy:', err.message));