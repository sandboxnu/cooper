import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Profile } from "./profiles";
import { Role } from "./roles";

export const ProfilesToRoles = pgTable(
  "profiles_to_roles",
  {
    profileId: uuid("profileId")
      .notNull()
      .references(() => Profile.id),
    roleId: uuid("roleId")
      .notNull()
      .references(() => Role.id),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.profileId, t.roleId] }),
  }),
);

export const ProfilesToRolesRelations = relations(
  ProfilesToRoles,
  ({ one }) => ({
    profile: one(Profile, {
      fields: [ProfilesToRoles.profileId],
      references: [Profile.id],
    }),
    role: one(Role, {
      fields: [ProfilesToRoles.roleId],
      references: [Role.id],
    }),
  }),
);

export const CreateProfileToRoleSchema = createInsertSchema(ProfilesToRoles, {
  profileId: z.string(),
  roleId: z.string(),
});
