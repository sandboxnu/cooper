import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Mock } from "vitest";

import type { Session } from "@cooper/auth";
import { auth } from "@cooper/auth";
import { and, desc, eq } from "@cooper/db";
import { db } from "@cooper/db/client";
import {
  Profile,
  ProfilesToCompanies,
  ProfilesToRoles,
  ProfilesToReviews,
} from "@cooper/db/schema";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";

const mockProfile = {
  id: "profile-1",
  firstName: "Jane",
  lastName: "Doe",
  major: "CS",
  minor: null,
  graduationYear: 2025,
  graduationMonth: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user-1",
};

vi.mock("@cooper/db/client", () => ({
  db: {
    query: {
      Profile: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    execute: vi.fn(),
    select: vi.fn(),
  },
}));

vi.mock("@cooper/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-1" },
    expires: "1",
  }),
}));

describe("Profile Router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (auth as Mock).mockResolvedValue({
      user: { id: "user-1" },
      expires: "1",
    });
    vi.mocked(db.query.Profile.findMany).mockResolvedValue([mockProfile]);
    vi.mocked(db.query.Profile.findFirst).mockResolvedValue(mockProfile);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as never);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as never);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as never);
    vi.mocked(db.execute).mockResolvedValue({
      rows: [{ profileId: "p1", companyId: "c1" }],
    } as never);
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ profileId: "p1", reviewId: "r1" }]),
      }),
    } as never);
  });

  const session: Session = { user: { id: "user-1" }, expires: "1" };

  const getCaller = async () => {
    const ctx = await createTRPCContext({
      session,
      headers: new Headers(),
    });
    return createCallerFactory(appRouter)(ctx);
  };

  test("list returns profiles", async () => {
    const caller = await getCaller();
    await caller.profile.list();
    expect(db.query.Profile.findMany).toHaveBeenCalledWith({
      orderBy: desc(Profile.id),
    });
  });

  test("getById returns profile by id", async () => {
    const caller = await getCaller();
    await caller.profile.getById({ id: "profile-1" });
    expect(db.query.Profile.findFirst).toHaveBeenCalledWith({
      where: eq(Profile.id, "profile-1"),
    });
  });

  test("getCurrentUser returns profile for session user", async () => {
    const caller = await getCaller();
    await caller.profile.getCurrentUser();
    expect(db.query.Profile.findFirst).toHaveBeenCalledWith({
      where: eq(Profile.userId, "user-1"),
    });
  });

  test("create inserts profile", async () => {
    const caller = await getCaller();
    const values = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values } as never);
    const year = new Date().getFullYear();
    await caller.profile.create({
      firstName: "Jane",
      lastName: "Doe",
      major: "CS",
      graduationYear: year,
      graduationMonth: 5,
      userId: "user-1",
    });
    expect(db.insert).toHaveBeenCalledWith(Profile);
    expect(values).toHaveBeenCalled();
  });

  test("delete deletes profile", async () => {
    const caller = await getCaller();
    const where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where } as never);
    await caller.profile.delete("profile-1");
    expect(db.delete).toHaveBeenCalledWith(Profile);
    expect(where).toHaveBeenCalledWith(eq(Profile.id, "profile-1"));
  });

  test("updateNameAndMajor updates profile", async () => {
    const caller = await getCaller();
    const where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({ where }),
    } as never);
    await caller.profile.updateNameAndMajor({
      id: "profile-1",
      firstName: "Jane",
      lastName: "Doe",
      major: "CS",
    });
    expect(db.update).toHaveBeenCalledWith(Profile);
    expect(where).toHaveBeenCalledWith(eq(Profile.id, "profile-1"));
  });

  test("favoriteCompany inserts profile-company", async () => {
    const caller = await getCaller();
    const values = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values } as never);
    await caller.profile.favoriteCompany({
      profileId: "profile-1",
      companyId: "company-1",
    });
    expect(db.insert).toHaveBeenCalledWith(ProfilesToCompanies);
    expect(values).toHaveBeenCalledWith({
      profileId: "profile-1",
      companyId: "company-1",
    });
  });

  test("unfavoriteCompany deletes relation", async () => {
    const caller = await getCaller();
    const where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where } as never);
    await caller.profile.unfavoriteCompany({
      profileId: "profile-1",
      companyId: "company-1",
    });
    expect(db.delete).toHaveBeenCalledWith(ProfilesToCompanies);
    expect(where).toHaveBeenCalledWith(
      and(
        eq(ProfilesToCompanies.profileId, "profile-1"),
        eq(ProfilesToCompanies.companyId, "company-1"),
      ),
    );
  });

  test("favoriteRole inserts profile-role", async () => {
    const caller = await getCaller();
    const values = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values } as never);
    await caller.profile.favoriteRole({
      profileId: "profile-1",
      roleId: "role-1",
    });
    expect(db.insert).toHaveBeenCalledWith(ProfilesToRoles);
  });

  test("unfavoriteRole deletes relation", async () => {
    const caller = await getCaller();
    const where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where } as never);
    await caller.profile.unfavoriteRole({
      profileId: "profile-1",
      roleId: "role-1",
    });
    expect(db.delete).toHaveBeenCalledWith(ProfilesToRoles);
  });

  test("favoriteReview inserts profile-review", async () => {
    const caller = await getCaller();
    const values = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values } as never);
    await caller.profile.favoriteReview({
      profileId: "profile-1",
      reviewId: "review-1",
    });
    expect(db.insert).toHaveBeenCalledWith(ProfilesToReviews);
  });

  test("unfavoriteReview deletes relation", async () => {
    const caller = await getCaller();
    const where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where } as never);
    await caller.profile.unfavoriteReview({
      profileId: "profile-1",
      reviewId: "review-1",
    });
    expect(db.delete).toHaveBeenCalledWith(ProfilesToReviews);
  });

  test("listFavoriteCompanies uses execute", async () => {
    const caller = await getCaller();
    const result = await caller.profile.listFavoriteCompanies({
      profileId: "profile-1",
    });
    expect(db.execute).toHaveBeenCalled();
    expect(result).toEqual([{ profileId: "p1", companyId: "c1" }]);
  });

  test("listFavoriteRoles uses execute", async () => {
    const caller = await getCaller();
    vi.mocked(db.execute).mockResolvedValue({
      rows: [{ profileId: "p1", roleId: "r1" }],
    } as never);
    const result = await caller.profile.listFavoriteRoles({
      profileId: "profile-1",
    });
    expect(db.execute).toHaveBeenCalled();
    expect(result).toEqual([{ profileId: "p1", roleId: "r1" }]);
  });

  test("listFavoriteReviews uses select", async () => {
    const caller = await getCaller();
    const result = await caller.profile.listFavoriteReviews({
      profileId: "profile-1",
    });
    expect(db.select).toHaveBeenCalled();
    expect(result).toEqual([{ profileId: "p1", reviewId: "r1" }]);
  });
});
