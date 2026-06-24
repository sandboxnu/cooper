import { beforeEach, describe, expect, test, vi } from "vitest";

import { appRouter } from "../src/root";
import { createCallerFactory, createTRPCContext } from "../src/trpc";
import { adminSession, chain } from "./helpers";

const tx = vi.hoisted(() => ({
  execute: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));

const db = vi.hoisted(() => ({
  query: {
    Review: { findMany: vi.fn() },
    Role: { findMany: vi.fn() },
    Company: { findMany: vi.fn() },
    Report: { findMany: vi.fn() },
    Flagged: { findFirst: vi.fn(), findMany: vi.fn() },
    Hidden: { findFirst: vi.fn(), findMany: vi.fn() },
    User: { findMany: vi.fn() },
  },
  insert: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@cooper/db/client", () => ({ db }));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

async function caller() {
  const ctx = await createTRPCContext({
    session: adminSession,
    headers: new Headers(),
  });
  return createCallerFactory(appRouter)(ctx);
}

const USER_ID = "11111111-1111-1111-1111-111111111111";
const ENTITY_ID = "22222222-2222-2222-2222-222222222222";

describe("admin router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.execute.mockResolvedValue(undefined);
    tx.insert.mockReturnValue(chain([{}]));
    tx.update.mockReturnValue(chain([{}]));
    db.transaction.mockImplementation((cb: (t: typeof tx) => unknown) =>
      cb(tx),
    );
    // Default every relational read to empty so procedures that fetch a type
    // they're not focused on don't blow up on `undefined.map(...)`.
    db.query.Review.findMany.mockResolvedValue([]);
    db.query.Role.findMany.mockResolvedValue([]);
    db.query.Company.findMany.mockResolvedValue([]);
    db.query.Report.findMany.mockResolvedValue([]);
    db.query.Flagged.findMany.mockResolvedValue([]);
    db.query.Hidden.findMany.mockResolvedValue([]);
  });

  test("userManagerItems maps users to a trimmed shape", async () => {
    db.query.User.findMany.mockResolvedValue([
      {
        id: "u1",
        name: "Jane",
        email: "jane@x.com",
        role: "STUDENT",
        isDisabled: false,
        createdAt: new Date(),
        extra: "dropped",
      },
    ]);

    const result = await (await caller()).admin.userManagerItems({});

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: "u1",
        name: "Jane",
        email: "jane@x.com",
        role: "STUDENT",
        isDisabled: false,
      }),
    );
    expect(result.items[0]).not.toHaveProperty("extra");
  });

  test("updateUserRole updates and returns success", async () => {
    db.update.mockReturnValue(chain([{}]));
    const result = await (
      await caller()
    ).admin.updateUserRole({
      userId: USER_ID,
      role: "ADMIN",
    });
    expect(result).toEqual({ success: true });
    expect(db.update).toHaveBeenCalledOnce();
  });

  test("updateUserDisabled updates and returns success", async () => {
    db.update.mockReturnValue(chain([{}]));
    const result = await (
      await caller()
    ).admin.updateUserDisabled({
      userId: USER_ID,
      isDisabled: true,
    });
    expect(result).toEqual({ success: true });
    expect(db.update).toHaveBeenCalledOnce();
  });

  test("setFlaggedStatus inserts a new flag when none is active", async () => {
    db.query.Flagged.findFirst.mockResolvedValue(undefined);
    db.insert.mockReturnValue(chain([{}]));

    const result = await (
      await caller()
    ).admin.setFlaggedStatus({
      entityType: "review",
      entityId: ENTITY_ID,
      flagged: true,
    });

    expect(result).toEqual({ success: true });
    expect(db.insert).toHaveBeenCalledOnce();
  });

  test("setFlaggedStatus deactivates the flag when unflagging", async () => {
    db.update.mockReturnValue(chain([{}]));

    const result = await (
      await caller()
    ).admin.setFlaggedStatus({
      entityType: "review",
      entityId: ENTITY_ID,
      flagged: false,
    });

    expect(result).toEqual({ success: true });
    expect(db.update).toHaveBeenCalledOnce();
    expect(db.insert).not.toHaveBeenCalled();
  });

  test("setHiddenStatus hides a review within a transaction", async () => {
    db.query.Hidden.findFirst.mockResolvedValue(undefined);

    const result = await (
      await caller()
    ).admin.setHiddenStatus({
      entityType: "review",
      entityId: ENTITY_ID,
      hidden: true,
    });

    expect(result).toEqual({ success: true });
    expect(db.transaction).toHaveBeenCalledOnce();
    expect(tx.execute).toHaveBeenCalled();
    expect(tx.insert).toHaveBeenCalledOnce();
  });

  test("setHiddenStatus unhides a review within a transaction", async () => {
    db.query.Hidden.findFirst.mockResolvedValue({ id: "h1" });

    const result = await (
      await caller()
    ).admin.setHiddenStatus({
      entityType: "review",
      entityId: ENTITY_ID,
      hidden: false,
    });

    expect(result).toEqual({ success: true });
    expect(tx.update).toHaveBeenCalledOnce();
    expect(tx.execute).toHaveBeenCalled();
  });

  test("setHiddenStatus hides a role within a transaction", async () => {
    db.query.Hidden.findFirst.mockResolvedValue(undefined);

    const result = await (
      await caller()
    ).admin.setHiddenStatus({
      entityType: "role",
      entityId: ENTITY_ID,
      hidden: true,
    });

    expect(result).toEqual({ success: true });
    expect(tx.execute).toHaveBeenCalled();
    expect(tx.insert).toHaveBeenCalledOnce();
  });

  test("setHiddenStatus unhides a role within a transaction", async () => {
    db.query.Hidden.findFirst.mockResolvedValue({ id: "h1" });

    const result = await (
      await caller()
    ).admin.setHiddenStatus({
      entityType: "role",
      entityId: ENTITY_ID,
      hidden: false,
    });

    expect(result).toEqual({ success: true });
    expect(tx.update).toHaveBeenCalledOnce();
    expect(tx.execute).toHaveBeenCalled();
  });

  test("setHiddenStatus hides a company within a transaction", async () => {
    db.query.Hidden.findFirst.mockResolvedValue(undefined);

    const result = await (
      await caller()
    ).admin.setHiddenStatus({
      entityType: "company",
      entityId: ENTITY_ID,
      hidden: true,
    });

    expect(result).toEqual({ success: true });
    expect(tx.execute).toHaveBeenCalled();
    expect(tx.insert).toHaveBeenCalledOnce();
  });

  test("setHiddenStatus unhides a company within a transaction", async () => {
    db.query.Hidden.findFirst.mockResolvedValue({ id: "h1" });

    const result = await (
      await caller()
    ).admin.setHiddenStatus({
      entityType: "company",
      entityId: ENTITY_ID,
      hidden: false,
    });

    expect(result).toEqual({ success: true });
    expect(tx.update).toHaveBeenCalledOnce();
    expect(tx.execute).toHaveBeenCalled();
  });

  describe("dashboard queries", () => {
    const now = new Date("2026-01-03T00:00:00Z");
    const earlier = new Date("2026-01-01T00:00:00Z");

    const review = (over: Record<string, unknown> = {}) => ({
      id: "rev1",
      roleId: "role1",
      companyId: "comp1",
      createdAt: now,
      reviewHeadline: "Headline",
      textReview: "Body text",
      ...over,
    });
    const role = (over: Record<string, unknown> = {}) => ({
      id: "role1",
      companyId: "comp1",
      createdAt: earlier,
      title: "Engineer",
      ...over,
    });
    const company = (over: Record<string, unknown> = {}) => ({
      id: "comp1",
      createdAt: earlier,
      name: "Acme",
      ...over,
    });

    test("dashboardItems returns sorted items and counts without a search", async () => {
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([role()]);
      db.query.Company.findMany.mockResolvedValue([]);
      db.query.Flagged.findMany.mockResolvedValue([
        { entityType: "review", entityId: "rev1" },
      ]);
      db.query.Hidden.findMany.mockResolvedValue([]);

      const result = await (await caller()).admin.dashboardItems({});

      expect(result.counts).toEqual({ reviews: 1, roles: 1, companies: 0 });
      // Newest (review at `now`) is sorted ahead of the role at `earlier`.
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          type: "review",
          id: "rev1",
          flagged: true,
          hidden: false,
        }),
      );
      expect(result.items[1]).toEqual(
        expect.objectContaining({ type: "role", id: "role1" }),
      );
    });

    test("dashboardItems expands a search across linked entities", async () => {
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([role()]);
      db.query.Company.findMany.mockResolvedValue([company()]);

      const result = await (
        await caller()
      ).admin.dashboardItems({
        search: "ac",
      });

      expect(result.counts).toEqual({ reviews: 1, roles: 1, companies: 1 });
    });

    test("dashboardItems returns nothing when the search matches no entities", async () => {
      const result = await (
        await caller()
      ).admin.dashboardItems({
        search: "no-such-thing",
      });

      expect(result.items).toEqual([]);
      expect(result.counts).toEqual({ reviews: 0, roles: 0, companies: 0 });
    });

    test("flaggedDashboardItems returns flagged items grouped by type", async () => {
      db.query.Flagged.findMany.mockResolvedValue([
        { entityType: "review", entityId: "rev1", createdAt: now },
        { entityType: "role", entityId: "role1", createdAt: earlier },
      ]);
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([role()]);

      const result = await (await caller()).admin.flaggedDashboardItems({});

      expect(result.counts).toEqual({ reviews: 1, roles: 1, companies: 0 });
      expect(result.items.every((item) => item.flagged && !item.hidden)).toBe(
        true,
      );
    });

    test("flaggedDashboardItems short-circuits when nothing is flagged", async () => {
      db.query.Flagged.findMany.mockResolvedValue([]);

      const result = await (await caller()).admin.flaggedDashboardItems({});

      expect(result).toEqual({
        items: [],
        counts: { reviews: 0, roles: 0, companies: 0 },
      });
    });

    test("flaggedDashboardItems intersects flags with a search expansion", async () => {
      db.query.Flagged.findMany.mockResolvedValue([
        { entityType: "review", entityId: "rev1", createdAt: now },
        { entityType: "role", entityId: "role1", createdAt: now },
        { entityType: "company", entityId: "comp1", createdAt: now },
        { entityType: "review", entityId: "unmatched", createdAt: now },
      ]);
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([role()]);
      db.query.Company.findMany.mockResolvedValue([company()]);

      const result = await (
        await caller()
      ).admin.flaggedDashboardItems({
        search: "ac",
      });

      expect(result.counts).toEqual({ reviews: 1, roles: 1, companies: 1 });
    });

    test("flaggedDashboardItems returns empty when the search expansion is empty", async () => {
      db.query.Flagged.findMany.mockResolvedValue([
        { entityType: "review", entityId: "rev1", createdAt: now },
      ]);

      const result = await (
        await caller()
      ).admin.flaggedDashboardItems({
        search: "no-match",
      });

      expect(result.items).toEqual([]);
      expect(result.counts).toEqual({ reviews: 0, roles: 0, companies: 0 });
    });

    test("hiddenDashboardItems returns hidden items marked hidden", async () => {
      db.query.Hidden.findMany.mockResolvedValue([
        { entityType: "role", entityId: "role1", createdAt: now },
      ]);
      db.query.Role.findMany.mockResolvedValue([role()]);

      const result = await (await caller()).admin.hiddenDashboardItems({});

      expect(result.counts).toEqual({ reviews: 0, roles: 1, companies: 0 });
      expect(result.items[0]).toEqual(
        expect.objectContaining({ type: "role", hidden: true, flagged: false }),
      );
    });

    test("dashboardItems marks hidden entities", async () => {
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([]);
      db.query.Company.findMany.mockResolvedValue([]);
      db.query.Flagged.findMany.mockResolvedValue([]);
      db.query.Hidden.findMany.mockResolvedValue([
        { entityType: "review", entityId: "rev1" },
      ]);

      const result = await (await caller()).admin.dashboardItems({});

      expect(result.items[0]).toEqual(
        expect.objectContaining({ id: "rev1", hidden: true, flagged: false }),
      );
    });

    test("hiddenDashboardItems intersects hidden entities with a search expansion", async () => {
      db.query.Hidden.findMany.mockResolvedValue([
        { entityType: "review", entityId: "rev1", createdAt: now },
        { entityType: "role", entityId: "role1", createdAt: now },
        { entityType: "company", entityId: "comp1", createdAt: now },
      ]);
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([role()]);
      db.query.Company.findMany.mockResolvedValue([company()]);

      const result = await (
        await caller()
      ).admin.hiddenDashboardItems({
        search: "ac",
      });

      expect(result.counts).toEqual({ reviews: 1, roles: 1, companies: 1 });
      expect(result.items.every((item) => item.hidden && !item.flagged)).toBe(
        true,
      );
    });

    test("hiddenDashboardItems returns empty when the search expansion is empty", async () => {
      db.query.Hidden.findMany.mockResolvedValue([
        { entityType: "role", entityId: "role1", createdAt: now },
      ]);

      const result = await (
        await caller()
      ).admin.hiddenDashboardItems({
        search: "no-match",
      });

      expect(result.items).toEqual([]);
      expect(result.counts).toEqual({ reviews: 0, roles: 0, companies: 0 });
    });

    test("reportedDashboardItems intersects reports with a search expansion", async () => {
      db.query.Report.findMany.mockResolvedValue([
        { reviewId: "rev1", roleId: null, companyId: null, createdAt: now },
        { reviewId: null, roleId: "role1", companyId: null, createdAt: now },
        { reviewId: null, roleId: null, companyId: "comp1", createdAt: now },
      ]);
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([role()]);
      db.query.Company.findMany.mockResolvedValue([company()]);
      db.query.Flagged.findMany.mockResolvedValue([]);
      db.query.Hidden.findMany.mockResolvedValue([
        { entityType: "company", entityId: "comp1" },
      ]);

      const result = await (
        await caller()
      ).admin.reportedDashboardItems({
        search: "ac",
      });

      expect(result.counts).toEqual({ reviews: 1, roles: 1, companies: 1 });
      const companyItem = result.items.find((item) => item.id === "comp1");
      expect(companyItem?.hidden).toBe(true);
    });

    test("hiddenDashboardItems short-circuits when nothing is hidden", async () => {
      db.query.Hidden.findMany.mockResolvedValue([]);

      const result = await (await caller()).admin.hiddenDashboardItems({});

      expect(result).toEqual({
        items: [],
        counts: { reviews: 0, roles: 0, companies: 0 },
      });
    });

    test("reportedDashboardItems gathers unique reported entities", async () => {
      db.query.Report.findMany.mockResolvedValue([
        { reviewId: "rev1", roleId: null, companyId: null, createdAt: now },
        { reviewId: "rev1", roleId: null, companyId: null, createdAt: now },
        { reviewId: null, roleId: "role1", companyId: null, createdAt: now },
      ]);
      db.query.Review.findMany.mockResolvedValue([review()]);
      db.query.Role.findMany.mockResolvedValue([role()]);
      db.query.Flagged.findMany.mockResolvedValue([
        { entityType: "review", entityId: "rev1" },
      ]);
      db.query.Hidden.findMany.mockResolvedValue([]);

      const result = await (await caller()).admin.reportedDashboardItems({});

      expect(result.counts).toEqual({ reviews: 1, roles: 1, companies: 0 });
      const reviewItem = result.items.find((item) => item.id === "rev1");
      expect(reviewItem?.flagged).toBe(true);
    });

    test("reportedDashboardItems short-circuits when there are no reports", async () => {
      db.query.Report.findMany.mockResolvedValue([]);

      const result = await (await caller()).admin.reportedDashboardItems({});

      expect(result).toEqual({
        items: [],
        counts: { reviews: 0, roles: 0, companies: 0 },
      });
    });

    test("reportedDashboardItems returns empty when the search expansion is empty", async () => {
      db.query.Report.findMany.mockResolvedValue([
        { reviewId: "rev1", roleId: null, companyId: null, createdAt: now },
      ]);

      const result = await (
        await caller()
      ).admin.reportedDashboardItems({
        search: "no-match",
      });

      expect(result.items).toEqual([]);
      expect(result.counts).toEqual({ reviews: 0, roles: 0, companies: 0 });
    });
  });
});
