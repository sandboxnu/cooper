import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
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
  adminId: uuid("adminId")
    .notNull()
    .references(() => User.id),
  isActive: boolean("isActive").notNull().default(true),
  deactivatedAt: timestamp("deactivatedAt", { mode: "date" }),
  deactivatedByAdminId: uuid("deactivatedByAdminId").references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HiddenRecordType = typeof Hidden.$inferSelect;

export const HiddenRelations = relations(Hidden, ({ one }) => ({
  admin: one(User, {
    fields: [Hidden.adminId],
    references: [User.id],
  }),
  deactivatedByAdmin: one(User, {
    fields: [Hidden.deactivatedByAdminId],
    references: [User.id],
  }),
}));

export const CreateHiddenSchema = createInsertSchema(Hidden, {
  entityType: z.nativeEnum(ModerationEntityType),
  entityId: z.string().uuid(),
  adminId: z.string().uuid(),
}).omit({
  id: true,
  isActive: true,
  deactivatedAt: true,
  deactivatedByAdminId: true,
  createdAt: true,
});
