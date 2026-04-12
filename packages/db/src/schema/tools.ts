import { relations, sql } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { ReviewsToTools } from "./reviewsToTools";

export const Tool = pgTable("tool", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export type ToolType = typeof Tool.$inferSelect;

export const ToolRelations = relations(Tool, ({ many }) => ({
  reviewsToTools: many(ReviewsToTools),
}));
