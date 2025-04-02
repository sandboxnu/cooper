import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Company } from "./companies";
import { User } from "./users";

export const UsersToCompanies = pgTable(
  "users_to_companies",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id),
    companyId: uuid("companyId")
      .notNull()
      .references(() => Company.id),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.companyId] }),
  }),
);

export const UsersToCompaniesRelations = relations(
  UsersToCompanies,
  ({ one }) => ({
    user: one(User, {
      fields: [UsersToCompanies.userId],
      references: [User.id],
    }),
    company: one(Company, {
      fields: [UsersToCompanies.companyId],
      references: [Company.id],
    }),
  }),
);

export const CreateUserToCompanySchema = createInsertSchema(UsersToCompanies, {
  userId: z.string(),
  companyId: z.string(),
});
