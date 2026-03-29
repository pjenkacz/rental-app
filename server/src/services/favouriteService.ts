import { db } from '../db';
import { favorites, listings } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const favoriteService = {

  // Pobierz wszystkie ulubione oferty użytkownika
  async getByUserId(userId: string) {
    return db.query.favorites.findMany({
      where: eq(favorites.userId, userId),
      with: {
        listing: {
          with: { images: true }
        }
      },
    });
  },

  async add(userId: string, listingId: string) {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, listingId })
      .returning();
    return favorite;
  },

  async remove(userId: string, listingId: string) {
    const [removed] = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.listingId, listingId)
        )
      )
      .returning();
    return removed;
  },
};