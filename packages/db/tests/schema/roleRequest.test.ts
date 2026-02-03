import { describe, expect, test } from "vitest";

import { RequestStatus } from "../../src/schema/misc";
import { CreateCompanyRequestSchema } from "../../src/schema/roleRequest";

describe("CreateCompanyRequestSchema (role request)", () => {
  const validInput = {
    roleTitle: "Software Engineer",
    roleDescription: "Build and ship features",
    companyId: "company-uuid-123",
    status: RequestStatus.PENDING,
  };

  test("parses valid input with all fields", () => {
    const result = CreateCompanyRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validInput);
    }
  });

  test("rejects missing required roleTitle", () => {
    const { roleTitle: _, ...without } = validInput;
    const result = CreateCompanyRequestSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  test("rejects missing required companyId", () => {
    const { companyId: _, ...without } = validInput;
    const result = CreateCompanyRequestSchema.safeParse(without);
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
