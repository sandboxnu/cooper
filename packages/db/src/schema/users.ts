import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { Account } from "./accounts";
import { Profile } from "./profiles";
import { UsersToCompanies } from "./usersToCompanies";
import { UsersToReviews } from "./usersToReviews";
import { UsersToRoles } from "./usersToRoles";

export const User = pgTable("user", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
});

export const UserRelations = relations(User, ({ one, many }) => ({
  accounts: many(Account),
  profile: one(Profile, {
    fields: [User.id],
    references: [Profile.userId],
  }),
  users_to_companies: many(UsersToCompanies),
  users_to_reviews: many(UsersToReviews),
  users_to_roles: many(UsersToRoles),
}));
