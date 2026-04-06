import { z } from 'zod';

const amenitiesEnum = z.enum(['parking', 'balkon', 'klimatyzacja', 'piwnica']);

export const imageSchema = z.object({
  url: z.string().url('Nieprawidłowy URL zdjęcia'),
  order: z.number().int().min(0),
});

export const createListingSchema = z.object({
  title: z.string().min(5, 'Tytuł musi mieć min. 5 znaków'),
  description: z.string().optional(),
  price: z.number().positive('Cena musi być dodatnia'),
  listingType: z.enum(['buy', 'rent']),
  propertyType: z.enum(['apartment', 'house', 'condo', 'land']),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.number().positive().optional(),
  floor: z.number().int().optional(),
  amenities: z.array(amenitiesEnum).default([]),
  address: z.string().min(3),
  city: z.string().min(2),
  country: z.string().default('USA'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(imageSchema).min(1, 'Wymagane co najmniej 1 zdjęcie'),
});

export const updateListingSchema = createListingSchema.partial();

export const listingQuerySchema = z.object({
  city: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  listingType: z.enum(['buy', 'rent']).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['price', 'area', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const mapQuerySchema = z.object({
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
