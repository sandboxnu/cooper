import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Role } from "./roles";
import { User } from "./users";

export const UsersToRoles = pgTable(
  "users_to_roles",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id),
    roleId: uuid("roleId")
      .notNull()
      .references(() => Role.id),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);

export const UsersToRolesRelations = relations(UsersToRoles, ({ one }) => ({
  user: one(User, {
    fields: [UsersToRoles.userId],
    references: [User.id],
  }),
  role: one(Role, {
    fields: [UsersToRoles.roleId],
    references: [Role.id],
  }),
}));

export const CreateUserToRoleSchema = createInsertSchema(UsersToRoles, {
  userId: z.string(),
  roleId: z.string(),
});
