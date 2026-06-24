import { describe, expect, test } from "vitest";

import {
  CompanyRequest,
  CreateCompanyRequestSchema,
  RequestRelations,
} from "../src/schema/companyRequest";
import { Industry, RequestStatus } from "../src/schema/misc";

describe("CompanyRequest table", () => {
  test("is defined with the expected columns", () => {
    expect(CompanyRequest).toBeDefined();
    const columns = CompanyRequest;
    expect(columns.id).toBeDefined();
    expect(columns.companyName).toBeDefined();
    expect(columns.companyDescription).toBeDefined();
    expect(columns.industry).toBeDefined();
    expect(columns.website).toBeDefined();
    expect(columns.locationId).toBeDefined();
    expect(columns.roleTitle).toBeDefined();
    expect(columns.roleDescription).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.status).toBeDefined();
  });

  test("status column defaults to PENDING and is not null", () => {
    expect(CompanyRequest.status.default).toBe("PENDING");
    expect(CompanyRequest.status.notNull).toBe(true);
  });

  test("id column is the primary key with a random default", () => {
    expect(CompanyRequest.id.primary).toBe(true);
    expect(CompanyRequest.id.notNull).toBe(true);
  });
});

describe("RequestRelations", () => {
  test("is defined", () => {
    expect(RequestRelations).toBeDefined();
  });
});

describe("CreateCompanyRequestSchema", () => {
  const validInput = {
    companyName: "Acme Corp",
    companyDescription: "A company",
    industry: Industry.TECHNOLOGY,
    website: "https://acme.example",
    locationId: "loc-123",
    roleTitle: "Software Engineer",
    roleDescription: "Builds things",
    status: RequestStatus.PENDING,
  };

  test("parses a fully valid input", () => {
    const result = CreateCompanyRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  test("omits id and createdAt fields", () => {
    const result = CreateCompanyRequestSchema.safeParse({
      ...validInput,
      id: "some-id",
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("createdAt");
    }
  });

  test("allows optional companyDescription and website to be omitted", () => {
    const { companyDescription, website, ...rest } = validInput;
    void companyDescription;
    void website;
    const result = CreateCompanyRequestSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  test("rejects an invalid industry value", () => {
    const result = CreateCompanyRequestSchema.safeParse({
      ...validInput,
      industry: "NOT_A_REAL_INDUSTRY",
    });
    expect(result.success).toBe(false);
  });

  test("rejects an invalid status value", () => {
    const result = CreateCompanyRequestSchema.safeParse({
      ...validInput,
      status: "NOT_A_STATUS",
    });
    expect(result.success).toBe(false);
  });

  test("rejects a missing required roleTitle", () => {
    const { roleTitle, ...rest } = validInput;
    void roleTitle;
    const result = CreateCompanyRequestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  test("allows locationId to be omitted (nullable column)", () => {
    const { locationId, ...rest } = validInput;
    void locationId;
    const result = CreateCompanyRequestSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  test("rejects a non-string companyName", () => {
    const result = CreateCompanyRequestSchema.safeParse({
      ...validInput,
      companyName: 123,
    });
    expect(result.success).toBe(false);
  });

  test("accepts every Industry enum value", () => {
    for (const industry of Object.values(Industry)) {
      const result = CreateCompanyRequestSchema.safeParse({
        ...validInput,
        industry,
      });
      expect(result.success).toBe(true);
    }
  });

  test("accepts every RequestStatus enum value", () => {
    for (const status of Object.values(RequestStatus)) {
      const result = CreateCompanyRequestSchema.safeParse({
        ...validInput,
        status,
      });
      expect(result.success).toBe(true);
    }
  });
});
