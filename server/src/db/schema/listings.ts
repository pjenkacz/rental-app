import { pgTable, text, numeric, integer, timestamp, uuid, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { listingImages } from "./images";

export const listingTypeEnum = pgEnum("listing_type", ["buy", "rent"]);
export const propertyTypeEnum = pgEnum("property_type", ["apartment", "house", "condo", "land"]);

export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Basic Info
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  
  // Type & Category
  listingType: listingTypeEnum("listing_type").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  
  // Property Details
  bedrooms: integer("bedrooms").default(0).notNull(),
  bathrooms: integer("bathrooms").default(0).notNull(),
  area: numeric("area", { precision: 10, scale: 2 }), // m²
  
  // Location
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").default("USA").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  
  // Relations
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Status
  isPublished: boolean("is_published").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  images: many(listingImages),
}));

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;