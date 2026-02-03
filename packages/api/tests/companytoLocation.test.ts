import { beforeEach, describe, expect, test, vi } from "vitest";

import type { Session } from "@cooper/auth";
import { auth } from "@cooper/auth";
import { eq } from "@cooper/db";
import { db } from "@cooper/db/client";
import { CompaniesToLocations, Location } from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";

const mockLocationsByCompany = [
  {
    companies_to_locations: { companyId: "c1", locationId: "loc1" },
    location: { id: "loc1", city: "Boston", state: "MA", country: "USA" },
  },
];

vi.mock("@cooper/db/client", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockLocationsByCompany)),
        })),
      })),
    })),
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn(),
}));

describe("CompanyToLocation Router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const chain = {
      from: vi.fn(function (this: unknown) {
        return {
          leftJoin: vi.fn(function (this: unknown) {
            return {
              where: vi.fn().mockResolvedValue(mockLocationsByCompany),
            };
          }),
        };
      }),
    };
    vi.mocked(db.select).mockReturnValue(chain as never);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);
  });

  const session: Session = { user: { id: "1" }, expires: "1" };

  const getCaller = async () => {
    vi.mocked(auth).mockResolvedValue(session);
    const ctx = await createTRPCContext({
      session,
      headers: new Headers(),
    });
    return createCallerFactory(appRouter)(ctx);
  };

  test("create inserts company-location relation", async () => {
    const caller = await getCaller();
    const values = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values } as never);

    await caller.companyToLocation.create({
      companyId: "c1",
      locationId: "loc1",
    });
    expect(db.insert).toHaveBeenCalledWith(CompaniesToLocations);
    expect(values).toHaveBeenCalledWith({
      companyId: "c1",
      locationId: "loc1",
    });
  });

  test("getLocationsByCompanyId returns locations for company", async () => {
    const caller = await getCaller();
    const result = await caller.companyToLocation.getLocationsByCompanyId({
      companyId: "c1",
    });
    expect(db.select).toHaveBeenCalled();
    expect(result).toEqual(mockLocationsByCompany);
  });
});
