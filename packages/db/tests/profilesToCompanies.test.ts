import { createTableRelationsHelpers } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";

import {
  CreateProfileToCompanySchema,
  ProfilesToCompanies,
  ProfilesToCompaniesRelations,
} from "../src/schema/profilesToCompanies";

describe("ProfilesToCompanies table", () => {
  test("defines the profileId and companyId columns", () => {
    expect(ProfilesToCompanies.profileId).toBeDefined();
    expect(ProfilesToCompanies.companyId).toBeDefined();
    expect(ProfilesToCompanies.profileId.notNull).toBe(true);
    expect(ProfilesToCompanies.companyId.notNull).toBe(true);
  });

  test("uses a composite primary key over both columns", () => {
    const { primaryKeys } = getTableConfig(ProfilesToCompanies);
    expect(primaryKeys).toHaveLength(1);
    const pkColumns = primaryKeys[0]?.columns.map((c) => c.name);
    expect(pkColumns).toEqual(["profileId", "companyId"]);
  });

  test("declares foreign keys to the profiles and companies tables", () => {
    const { foreignKeys } = getTableConfig(ProfilesToCompanies);
    expect(foreignKeys).toHaveLength(2);
    const referencedTables = foreignKeys
      .map((fk) => getTableConfig(fk.reference().foreignTable).name)
      .sort();
    expect(referencedTables).toEqual(["company", "profile"]);
  });
});

describe("ProfilesToCompaniesRelations", () => {
  test("maps profile and company relations to their tables", () => {
    const relations = ProfilesToCompaniesRelations.config(
      createTableRelationsHelpers(ProfilesToCompanies),
    );
    expect(Object.keys(relations).sort()).toEqual(["company", "profile"]);
    expect(getTableConfig(relations.profile.referencedTable).name).toBe(
      "profile",
    );
    expect(getTableConfig(relations.company.referencedTable).name).toBe(
      "company",
    );
  });
});

describe("CreateProfileToCompanySchema", () => {
  test("parses a valid profile/company pair", () => {
    const result = CreateProfileToCompanySchema.safeParse({
      profileId: "p1",
      companyId: "c1",
    });
    expect(result.success).toBe(true);
  });

  test("rejects a missing companyId", () => {
    const result = CreateProfileToCompanySchema.safeParse({ profileId: "p1" });
    expect(result.success).toBe(false);
  });

  test("rejects non-string ids", () => {
    const result = CreateProfileToCompanySchema.safeParse({
      profileId: 1,
      companyId: 2,
    });
    expect(result.success).toBe(false);
  });
});
