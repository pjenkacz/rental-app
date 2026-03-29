import { pgTable, text, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { listings } from "./listings";

export const favorites = pgTable("favorites", {
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.listingId] }),
}));

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;