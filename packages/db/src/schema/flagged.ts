import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import type { ModerationEntityTypeType } from "./misc";
import { ModerationEntityType } from "./misc";
import { User } from "./users";

export const Flagged = pgTable("flagged", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  entityType: varchar("entityType", { length: 32 })
    .$type<ModerationEntityTypeType>()
    .notNull(),
  entityId: uuid("entityId").notNull(),
  description: text("description").notNull(),
  adminId: uuid("adminId")
    .notNull()
    .references(() => User.id),
  isActive: boolean("isActive").notNull().default(true),
  deactivatedAt: timestamp("deactivatedAt", { mode: "date" }),
  deactivatedByAdminId: uuid("deactivatedByAdminId").references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlaggedRecordType = typeof Flagged.$inferSelect;

export const FlaggedRelations = relations(Flagged, ({ one }) => ({
  admin: one(User, {
    fields: [Flagged.adminId],
    references: [User.id],
  }),
  deactivatedByAdmin: one(User, {
    fields: [Flagged.deactivatedByAdminId],
    references: [User.id],
  }),
}));

export const CreateFlaggedSchema = createInsertSchema(Flagged, {
  entityType: () => z.nativeEnum(ModerationEntityType),
  entityId: () => z.string().uuid(),
  description: () => z.string().min(1),
  adminId: () => z.string().uuid(),
}).omit({
  id: true,
  isActive: true,
  deactivatedAt: true,
  deactivatedByAdminId: true,
  createdAt: true,
});
