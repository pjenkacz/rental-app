import { db } from '../db';
import { listings } from '../db/schema';
import { eq, and, gte, lte, ilike } from 'drizzle-orm';
import { NewListing } from '../db/schema/listings';

interface ListingFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: 'buy' | 'rent';
  bedrooms?: number;
}

export const listingService = {

  async getAll(filters: ListingFilters = {}) {
    const conditions = [eq(listings.isPublished, true)];

    if (filters.city) {
      conditions.push(ilike(listings.city, `%${filters.city}%`));
    }
    if (filters.minPrice) {
      conditions.push(gte(listings.price, String(filters.minPrice)));
    }
    if (filters.maxPrice) {
      conditions.push(lte(listings.price, String(filters.maxPrice)));
    }
    if (filters.listingType) {
      conditions.push(eq(listings.listingType, filters.listingType));
    }
    if (filters.bedrooms) {
      conditions.push(eq(listings.bedrooms, filters.bedrooms));
    }

    return db.query.listings.findMany({
      where: and(...conditions),
      with: { images: true, user: true },
      orderBy: (listings, { desc }) => [desc(listings.createdAt)],
    });
  },

  async getById(id: string) {
    return db.query.listings.findFirst({
      where: eq(listings.id, id),
      with: { images: true, user: true },
    });
  },

  async create(data: NewListing) {
    const [newListing] = await db
      .insert(listings)
      .values(data)
      .returning(); // ← zwróć wstawiony rekord
    return newListing;
  },

  async update(id: string, userId: string, data: Partial<NewListing>) {
    const [updated] = await db
      .update(listings)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(listings.id, id),
          eq(listings.userId, userId) // ← tylko właściciel może edytować
        )
      )
      .returning();
    return updated;
  },

  async delete(id: string, userId: string) {
    const [deleted] = await db
      .delete(listings)
      .where(
        and(
          eq(listings.id, id),
          eq(listings.userId, userId) // ← tylko właściciel może usunąć
        )
      )
      .returning();
    return deleted;
  },
};