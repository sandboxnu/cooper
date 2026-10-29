import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { Account } from "./accounts";
import { Profile } from "./profiles";
import { UserRole } from "./misc";
import type { UserRoleType } from "./misc";

export const User = pgTable(
  "user",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: varchar("image", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    role: varchar("role", { length: 32 })
      .$type<UserRoleType>()
      .notNull()
      .default(UserRole.STUDENT),
    isDisabled: boolean("isDisabled").notNull().default(false),
  },
  (table) => ({
    emailLowerUnique: uniqueIndex("user_email_lower_unique").on(
      sql`lower(${table.email})`,
    ),
  }),
);

export const UserRelations = relations(User, ({ one, many }) => ({
  accounts: many(Account),
  profile: one(Profile, {
    fields: [User.id],
    references: [Profile.userId],
  }),
}));
