import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { ModerationActionType, ModerationEntityType } from "./misc";
import type {
  ModerationActionTypeType,
  ModerationEntityTypeType,
} from "./misc";
import { User } from "./users";

export const ModerationAction = pgTable("moderation_action", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  entityType: varchar("entityType", { length: 32 })
    .$type<ModerationEntityTypeType>()
    .notNull(),
  entityId: uuid("entityId").notNull(),
  actionType: varchar("actionType", { length: 32 })
    .$type<ModerationActionTypeType>()
    .notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  note: text("note"),
  adminId: uuid("adminId")
    .notNull()
    .references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModerationActionRecordType = typeof ModerationAction.$inferSelect;

export const ModerationActionRelations = relations(
  ModerationAction,
  ({ one }) => ({
    admin: one(User, {
      fields: [ModerationAction.adminId],
      references: [User.id],
    }),
  }),
);

export const CreateModerationActionSchema = createInsertSchema(
  ModerationAction,
  {
    entityType: z.nativeEnum(ModerationEntityType),
    entityId: z.string().uuid(),
    actionType: z.nativeEnum(ModerationActionType),
    reason: z.string().min(1),
    note: z.string().optional(),
    adminId: z.string().uuid(),
  },
).omit({
  id: true,
  createdAt: true,
});
