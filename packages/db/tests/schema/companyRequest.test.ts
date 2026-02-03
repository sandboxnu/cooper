import { describe, expect, test } from "vitest";

import { Industry, RequestStatus } from "../../src/schema/misc";
import { CreateCompanyRequestSchema } from "../../src/schema/companyRequest";

describe("CreateCompanyRequestSchema", () => {
  const validInput = {
    companyName: "Acme Corp",
    companyDescription: "A great company",
    industry: Industry.TECHNOLOGY,
    website: "https://acme.example.com",
    locationId: "loc-123",
    roleTitle: "Software Engineer",
    roleDescription: "Build things",
    status: RequestStatus.PENDING,
  };

  test("parses valid input with all fields", () => {
    const result = CreateCompanyRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validInput);
    }
  });

  test("parses valid input with optional fields omitted", () => {
    const minimal = {
      companyName: "Minimal Co",
      industry: Industry.HEALTHCARE,
      locationId: "loc-456",
      roleTitle: "Analyst",
      roleDescription: "Analyze data",
      status: RequestStatus.PENDING,
    };
    const result = CreateCompanyRequestSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Minimal Co");
      expect(result.data.industry).toBe(Industry.HEALTHCARE);
      expect(result.data.companyDescription).toBeUndefined();
      expect(result.data.website).toBeUndefined();
    }
  });

  test("rejects missing required companyName", () => {
    const { companyName: _, ...without } = validInput;
    const result = CreateCompanyRequestSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  test("rejects missing required industry", () => {
    const { industry: _, ...without } = validInput;
    const result = CreateCompanyRequestSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  test("rejects missing required roleTitle", () => {
    const { roleTitle: _, ...without } = validInput;
    const result = CreateCompanyRequestSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  test("rejects invalid industry enum value", () => {
    const result = CreateCompanyRequestSchema.safeParse({
      ...validInput,
      industry: "INVALID_INDUSTRY",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid status enum value", () => {
    const result = CreateCompanyRequestSchema.safeParse({
      ...validInput,
      status: "INVALID_STATUS",
    });
    expect(result.success).toBe(false);
  });

  test("accepts all RequestStatus values", () => {
    for (const status of Object.values(RequestStatus)) {
      const result = CreateCompanyRequestSchema.safeParse({
        ...validInput,
        status,
      });
      expect(result.success, `Expected status ${status} to be valid`).toBe(
        true,
      );
    }
  });

  test("accepts all Industry values", () => {
    for (const industry of Object.values(Industry)) {
      const result = CreateCompanyRequestSchema.safeParse({
        ...validInput,
        industry,
      });
      expect(result.success, `Expected industry ${industry} to be valid`).toBe(
        true,
      );
    }
  });

  test("strips id and createdAt if provided", () => {
    const withExtra = {
      ...validInput,
      id: "some-uuid",
      createdAt: new Date(),
    };
    const result = CreateCompanyRequestSchema.safeParse(withExtra);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("createdAt");
    }
  });
});
