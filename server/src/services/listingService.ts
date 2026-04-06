import { db } from '../db';
import { listings, listingImages } from '../db/schema';
import { eq, and, gte, lte, ilike, isNull, asc, desc } from 'drizzle-orm';
import type { NewListing, Listing } from '../db/schema/listings';
import type { ListingImage } from '../db/schema/images';

interface ImageInput {
  url: string;
  order: number;
}

// Drizzle returns numeric columns as strings — this converts them to numbers
function mapListing(raw: Listing & { images: ListingImage[] }) {
  return {
    ...raw,
    price: parseFloat(raw.price),
    area: raw.area != null ? parseFloat(raw.area) : null,
    latitude: parseFloat(raw.latitude),
    longitude: parseFloat(raw.longitude),
  };
}

type SortBy = 'price' | 'area' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface ListingFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: 'buy' | 'rent';
  bedrooms?: number;
  limit?: number;
  offset?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

const sortColumns = {
  price: listings.price,
  area: listings.area,
  createdAt: listings.createdAt,
} as const;

export const listingService = {

  async getAll(filters: ListingFilters = {}) {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const conditions = [
      eq(listings.isPublished, true),
      isNull(listings.deletedAt),
    ];

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

    const orderFn = sortOrder === 'asc' ? asc : desc;
    const orderCol = sortColumns[sortBy];

    const results = await db.query.listings.findMany({
      where: and(...conditions),
      with: { images: true, user: true },
      orderBy: orderFn(orderCol),
      limit: Math.min(limit, 100),
      offset,
    });

    return results.map(mapListing);
  },

  async getMapPins(swLat: number, swLng: number, neLat: number, neLng: number) {
    const results = await db
      .select({
        id: listings.id,
        latitude: listings.latitude,
        longitude: listings.longitude,
        price: listings.price,
      })
      .from(listings)
      .where(
        and(
          eq(listings.isPublished, true),
          isNull(listings.deletedAt),
          gte(listings.latitude, String(swLat)),
          lte(listings.latitude, String(neLat)),
          gte(listings.longitude, String(swLng)),
          lte(listings.longitude, String(neLng)),
        )
      );

    return results.map(r => ({
      id: r.id,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      price: parseFloat(r.price),
    }));
  },

  async getCities(query: string) {
    const results = await db
      .selectDistinct({ city: listings.city })
      .from(listings)
      .where(
        and(
          isNull(listings.deletedAt),
          eq(listings.isPublished, true),
          ilike(listings.city, `%${query}%`)
        )
      )
      .limit(10);

    return results.map(r => r.city);
  },

  async getById(id: string) {
    const result = await db.query.listings.findFirst({
      where: and(eq(listings.id, id), isNull(listings.deletedAt)),
      with: { images: true, user: true },
    });
    return result ? mapListing(result) : null;
  },

  async getByUserId(userId: string) {
    const results = await db.query.listings.findMany({
      where: and(eq(listings.userId, userId), isNull(listings.deletedAt)),
      with: { images: true },
      orderBy: desc(listings.createdAt),
    });
    return results.map(mapListing);
  },

  async create(data: NewListing, images: ImageInput[] = []) {
    // neon-http driver does not support transactions — sequential inserts
    const [newListing] = await db
      .insert(listings)
      .values(data)
      .returning();

    if (images.length > 0) {
      await db.insert(listingImages).values(
        images.map((img) => ({
          listingId: newListing.id,
          url: img.url,
          order: img.order,
        }))
      );
    }

    return newListing;
  },

  async update(id: string, userId: string, data: Partial<NewListing>) {
    const [updated] = await db
      .update(listings)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(listings.id, id),
          eq(listings.userId, userId),
          isNull(listings.deletedAt),
        )
      )
      .returning();
    return updated;
  },

  async delete(id: string, userId: string) {
    // Soft-delete: ustawiamy deletedAt zamiast usuwać rekord
    const [deleted] = await db
      .update(listings)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(listings.id, id),
          eq(listings.userId, userId),
          isNull(listings.deletedAt),
        )
      )
      .returning();
    return deleted;
  },
};
