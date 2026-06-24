import { createTableRelationsHelpers } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";

import {
  CreateProfileToRoleSchema,
  ProfilesToRoles,
  ProfilesToRolesRelations,
} from "../src/schema/profilesToRoles";

describe("ProfilesToRoles table", () => {
  test("defines the profileId and roleId columns", () => {
    expect(ProfilesToRoles.profileId).toBeDefined();
    expect(ProfilesToRoles.roleId).toBeDefined();
    expect(ProfilesToRoles.profileId.notNull).toBe(true);
    expect(ProfilesToRoles.roleId.notNull).toBe(true);
  });

  test("uses a composite primary key over both columns", () => {
    const { primaryKeys } = getTableConfig(ProfilesToRoles);
    expect(primaryKeys).toHaveLength(1);
    const pkColumns = primaryKeys[0]?.columns.map((c) => c.name);
    expect(pkColumns).toEqual(["profileId", "roleId"]);
  });

  test("declares foreign keys to the profiles and roles tables", () => {
    const { foreignKeys } = getTableConfig(ProfilesToRoles);
    expect(foreignKeys).toHaveLength(2);
    const referencedTables = foreignKeys
      .map((fk) => getTableConfig(fk.reference().foreignTable).name)
      .sort();
    expect(referencedTables).toEqual(["profile", "role"]);
  });
});

describe("ProfilesToRolesRelations", () => {
  test("maps profile and role relations to their tables", () => {
    const relations = ProfilesToRolesRelations.config(
      createTableRelationsHelpers(ProfilesToRoles),
    );
    expect(Object.keys(relations).sort()).toEqual(["profile", "role"]);
    expect(getTableConfig(relations.profile.referencedTable).name).toBe(
      "profile",
    );
    expect(getTableConfig(relations.role.referencedTable).name).toBe("role");
  });
});

describe("CreateProfileToRoleSchema", () => {
  test("parses a valid profile/role pair", () => {
    const result = CreateProfileToRoleSchema.safeParse({
      profileId: "p1",
      roleId: "r1",
    });
    expect(result.success).toBe(true);
  });

  test("rejects a missing roleId", () => {
    const result = CreateProfileToRoleSchema.safeParse({ profileId: "p1" });
    expect(result.success).toBe(false);
  });

  test("rejects non-string ids", () => {
    const result = CreateProfileToRoleSchema.safeParse({
      profileId: 1,
      roleId: 2,
    });
    expect(result.success).toBe(false);
  });
});
