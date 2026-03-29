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

export const Hidden = pgTable("hidden", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HiddenRecordType = typeof Hidden.$inferSelect;

export const HiddenRelations = relations(Hidden, ({ one }) => ({
  admin: one(User, {
    fields: [Hidden.adminId],
    references: [User.id],
  }),
}));

export const CreateHiddenSchema = createInsertSchema(Hidden, {
  entityType: z.nativeEnum(ModerationEntityType),
  entityId: z.string().uuid(),
  description: z.string().min(1),
  adminId: z.string().uuid(),
}).omit({
  id: true,
  isActive: true,
  createdAt: true,
});
