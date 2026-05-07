import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { CooperDb } from "@cooper/db/client";
import { and, desc, eq, ilike, inArray, or, sql } from "@cooper/db";
import {
  Company,
  Flagged,
  Hidden,
  ModerationEntityType,
  Report,
  Review,
  Role,
  User,
  UserRole,
} from "@cooper/db/schema";
import type { ModerationEntityTypeType } from "@cooper/db/schema";

import { protectedProcedure } from "../trpc";

const getTime = (d: Date | string) =>
  d instanceof Date ? d.getTime() : new Date(d).getTime();

const sortByCreatedAtDesc = <T extends { createdAt: Date | string }>(
  items: T[],
) => items.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

const fetchWhenIdsPresent = <T>(
  ids: string[],
  query: () => Promise<T[]>,
): Promise<T[]> => (ids.length > 0 ? query() : Promise.resolve([]));

const moderationKey = (entityType: string, entityId: string) =>
  `${entityType}:${entityId}`;

interface ModerationFlags {
  flagged: (entityType: string, entityId: string) => boolean;
  hidden: (entityType: string, entityId: string) => boolean;
}

const mapReviewItem = (
  review: {
    id: string;
    createdAt: Date;
    reviewHeadline: string | null;
    textReview: string | null;
  },
  flags: ModerationFlags,
) => ({
  type: "review" as const,
  id: review.id,
  createdAt: review.createdAt,
  headline: review.reviewHeadline,
  text: review.textReview,
  flagged: flags.flagged(ModerationEntityType.REVIEW, review.id),
  hidden: flags.hidden(ModerationEntityType.REVIEW, review.id),
});

const mapRoleItem = (
  role: { id: string; createdAt: Date; title: string; companyId: string },
  flags: ModerationFlags,
) => ({
  type: "role" as const,
  id: role.id,
  createdAt: role.createdAt,
  title: role.title,
  companyId: role.companyId,
  flagged: flags.flagged(ModerationEntityType.ROLE, role.id),
  hidden: flags.hidden(ModerationEntityType.ROLE, role.id),
});

const mapCompanyItem = (
  company: { id: string; createdAt: Date; name: string },
  flags: ModerationFlags,
) => ({
  type: "company" as const,
  id: company.id,
  createdAt: company.createdAt,
  name: company.name,
  flagged: flags.flagged(ModerationEntityType.COMPANY, company.id),
  hidden: flags.hidden(ModerationEntityType.COMPANY, company.id),
});

/** Resolves company / role / review IDs tied together: direct text hits plus all roles & reviews for matched companies and linked reviews for matched roles. */
async function getExpandedSearchEntityIds(db: CooperDb, search: string) {
  const pattern = `%${search}%`;

  const [nameMatchedCompanies, titleMatchedRoles, textMatchedReviews] =
    await Promise.all([
      db.query.Company.findMany({
        where: ilike(Company.name, pattern),
        columns: { id: true },
      }),
      db.query.Role.findMany({
        where: ilike(Role.title, pattern),
        columns: { id: true, companyId: true },
      }),
      db.query.Review.findMany({
        where: or(
          ilike(Review.textReview, pattern),
          ilike(Review.reviewHeadline, pattern),
        ),
        columns: { id: true, roleId: true, companyId: true },
      }),
    ]);

  const companyIds = new Set<string>();
  const roleIds = new Set<string>();
  const reviewIds = new Set<string>();

  for (const c of nameMatchedCompanies) companyIds.add(c.id);
  for (const r of titleMatchedRoles) {
    roleIds.add(r.id);
    companyIds.add(r.companyId);
  }
  for (const rv of textMatchedReviews) {
    reviewIds.add(rv.id);
    companyIds.add(rv.companyId ?? "");
    roleIds.add(rv.roleId ?? "");
  }

  if (companyIds.size === 0 && roleIds.size === 0 && reviewIds.size === 0) {
    return {
      companyIds: new Set<string>(),
      roleIds: new Set<string>(),
      reviewIds: new Set<string>(),
    };
  }

  for (let pass = 0; pass < 6; pass++) {
    const before = companyIds.size + roleIds.size;
    const cList = [...companyIds];
    if (cList.length > 0) {
      const rolesAtCompanies = await db.query.Role.findMany({
        where: (role, { inArray: inArr }) => inArr(role.companyId, cList),
        columns: { id: true, companyId: true },
      });
      for (const r of rolesAtCompanies) {
        roleIds.add(r.id);
        companyIds.add(r.companyId);
      }
    }
    const rList = [...roleIds];
    if (rList.length > 0) {
      const roleRows = await db.query.Role.findMany({
        where: (role, { inArray: inArr }) => inArr(role.id, rList),
        columns: { companyId: true },
      });
      for (const r of roleRows) companyIds.add(r.companyId);
    }
    if (companyIds.size + roleIds.size === before) break;
  }

  const companyIdList = [...companyIds];
  const roleIdList = [...roleIds];

  const reviewWhereParts = [];
  if (companyIdList.length > 0) {
    reviewWhereParts.push(inArray(Review.companyId, companyIdList));
  }
  if (roleIdList.length > 0) {
    reviewWhereParts.push(inArray(Review.roleId, roleIdList));
  }

  if (reviewWhereParts.length > 0) {
    const linkedReviews = await db.query.Review.findMany({
      where:
        reviewWhereParts.length === 1
          ? reviewWhereParts[0]
          : or(...reviewWhereParts),
      columns: { id: true },
    });
    for (const rv of linkedReviews) reviewIds.add(rv.id);
  }

  return { companyIds, roleIds, reviewIds };
}

async function fetchDashboardRowsForExpandedSearch(args: {
  db: CooperDb;
  limitPerType: number;
  companyIds: Set<string>;
  roleIds: Set<string>;
  reviewIds: Set<string>;
}) {
  const { db, limitPerType, companyIds, roleIds, reviewIds } = args;
  const companyIdArr = [...companyIds];
  const roleIdArr = [...roleIds];
  const reviewIdArr = [...reviewIds];

  const [reviews, roles, companies] = await Promise.all([
    fetchWhenIdsPresent(reviewIdArr, () =>
      db.query.Review.findMany({
        orderBy: desc(Review.createdAt),
        where: (review, { inArray: inArr }) => inArr(review.id, reviewIdArr),
        limit: limitPerType,
      }),
    ),
    fetchWhenIdsPresent(roleIdArr, () =>
      db.query.Role.findMany({
        orderBy: desc(Role.createdAt),
        where: (role, { inArray: inArr }) => inArr(role.id, roleIdArr),
        limit: limitPerType,
      }),
    ),
    fetchWhenIdsPresent(companyIdArr, () =>
      db.query.Company.findMany({
        orderBy: desc(Company.createdAt),
        where: (company, { inArray: inArr }) => inArr(company.id, companyIdArr),
        limit: limitPerType,
      }),
    ),
  ]);

  return { reviews, roles, companies };
}

function filterIdsBySearchExpansion(
  ids: string[],
  expanded: {
    companyIds: Set<string>;
    roleIds: Set<string>;
    reviewIds: Set<string>;
  },
  kind: "review" | "role" | "company",
) {
  const allow =
    kind === "review"
      ? expanded.reviewIds
      : kind === "role"
        ? expanded.roleIds
        : expanded.companyIds;
  return ids.filter((id) => allow.has(id));
}

export const adminRouter = {
  dashboardItems: protectedProcedure
    .input(
      z
        .object({
          limitPerType: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;
      const search = input?.search?.trim() ?? "";
      const hasSearch = search.length > 0;

      let reviews: Awaited<ReturnType<typeof ctx.db.query.Review.findMany>> =
        [];
      let roles: Awaited<ReturnType<typeof ctx.db.query.Role.findMany>> = [];
      let companies: Awaited<ReturnType<typeof ctx.db.query.Company.findMany>> =
        [];

      if (!hasSearch) {
        [reviews, roles, companies] = await Promise.all([
          ctx.db.query.Review.findMany({
            orderBy: desc(Review.createdAt),
            limit: limitPerType,
          }),
          ctx.db.query.Role.findMany({
            orderBy: desc(Role.createdAt),
            limit: limitPerType,
          }),
          ctx.db.query.Company.findMany({
            orderBy: desc(Company.createdAt),
            limit: limitPerType,
          }),
        ]);
      } else {
        const expanded = await getExpandedSearchEntityIds(ctx.db, search);
        const emptyExpanded =
          expanded.companyIds.size === 0 &&
          expanded.roleIds.size === 0 &&
          expanded.reviewIds.size === 0;
        if (!emptyExpanded) {
          const rows = await fetchDashboardRowsForExpandedSearch({
            db: ctx.db,
            limitPerType,
            companyIds: expanded.companyIds,
            roleIds: expanded.roleIds,
            reviewIds: expanded.reviewIds,
          });
          reviews = rows.reviews;
          roles = rows.roles;
          companies = rows.companies;
        }
      }

      const [flaggedRecords, hiddenRecords] = await Promise.all([
        ctx.db.query.Flagged.findMany({
          where: eq(Flagged.isActive, true),
        }),
        ctx.db.query.Hidden.findMany({
          where: eq(Hidden.isActive, true),
        }),
      ]);

      const flaggedKeys = new Set(
        flaggedRecords.map((record) =>
          moderationKey(record.entityType, record.entityId),
        ),
      );
      const hiddenKeys = new Set(
        hiddenRecords.map((record) =>
          moderationKey(record.entityType, record.entityId),
        ),
      );

      const flags: ModerationFlags = {
        flagged: (entityType, entityId) =>
          flaggedKeys.has(moderationKey(entityType, entityId)),
        hidden: (entityType, entityId) =>
          hiddenKeys.has(moderationKey(entityType, entityId)),
      };

      const reviewItems = reviews.map((review) => mapReviewItem(review, flags));
      const roleItems = roles.map((role) => mapRoleItem(role, flags));
      const companyItems = companies.map((company) =>
        mapCompanyItem(company, flags),
      );

      const items = sortByCreatedAtDesc([
        ...reviewItems,
        ...roleItems,
        ...companyItems,
      ]);

      return {
        items,
        counts: {
          reviews: reviews.length,
          roles: roles.length,
          companies: companies.length,
        },
      };
    }),
  flaggedDashboardItems: protectedProcedure
    .input(
      z
        .object({
          limitPerType: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;
      const search = input?.search?.trim() ?? "";
      const hasSearch = search.length > 0;

      const flagged = await ctx.db.query.Flagged.findMany({
        orderBy: desc(Flagged.createdAt),
        where: eq(Flagged.isActive, true),
      });

      let reviewIds = flagged
        .filter((f) => f.entityType === ModerationEntityType.REVIEW)
        .map((f) => f.entityId);
      let roleIds = flagged
        .filter((f) => f.entityType === ModerationEntityType.ROLE)
        .map((f) => f.entityId);
      let companyIds = flagged
        .filter((f) => f.entityType === ModerationEntityType.COMPANY)
        .map((f) => f.entityId);

      if (hasSearch) {
        const expanded = await getExpandedSearchEntityIds(ctx.db, search);
        if (
          expanded.companyIds.size === 0 &&
          expanded.roleIds.size === 0 &&
          expanded.reviewIds.size === 0
        ) {
          return {
            items: [],
            counts: {
              reviews: 0,
              roles: 0,
              companies: 0,
            },
          };
        }
        reviewIds = filterIdsBySearchExpansion(reviewIds, expanded, "review");
        roleIds = filterIdsBySearchExpansion(roleIds, expanded, "role");
        companyIds = filterIdsBySearchExpansion(
          companyIds,
          expanded,
          "company",
        );
      }

      if (
        reviewIds.length === 0 &&
        roleIds.length === 0 &&
        companyIds.length === 0
      ) {
        return {
          items: [],
          counts: {
            reviews: 0,
            roles: 0,
            companies: 0,
          },
        };
      }

      const [reviews, roles, companies] = await Promise.all([
        fetchWhenIdsPresent(reviewIds, () =>
          ctx.db.query.Review.findMany({
            orderBy: desc(Review.createdAt),
            where: (review, { inArray }) => inArray(review.id, reviewIds),
            limit: limitPerType,
          }),
        ),
        fetchWhenIdsPresent(roleIds, () =>
          ctx.db.query.Role.findMany({
            orderBy: desc(Role.createdAt),
            where: (role, { inArray }) => inArray(role.id, roleIds),
            limit: limitPerType,
          }),
        ),
        fetchWhenIdsPresent(companyIds, () =>
          ctx.db.query.Company.findMany({
            orderBy: desc(Company.createdAt),
            where: (company, { inArray }) => inArray(company.id, companyIds),
            limit: limitPerType,
          }),
        ),
      ]);

      const flags: ModerationFlags = {
        flagged: () => true,
        hidden: () => false,
      };

      const reviewItems = reviews.map((review) => mapReviewItem(review, flags));
      const roleItems = roles.map((role) => mapRoleItem(role, flags));
      const companyItems = companies.map((company) =>
        mapCompanyItem(company, flags),
      );

      const items = sortByCreatedAtDesc([
        ...reviewItems,
        ...roleItems,
        ...companyItems,
      ]);

      return {
        items,
        counts: {
          reviews: reviews.length,
          roles: roles.length,
          companies: companies.length,
        },
      };
    }),
  hiddenDashboardItems: protectedProcedure
    .input(
      z
        .object({
          limitPerType: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;
      const search = input?.search?.trim() ?? "";
      const hasSearch = search.length > 0;

      const hidden = await ctx.db.query.Hidden.findMany({
        orderBy: desc(Hidden.createdAt),
        where: eq(Hidden.isActive, true),
      });

      let reviewIds = hidden
        .filter((h) => h.entityType === ModerationEntityType.REVIEW)
        .map((h) => h.entityId);
      let roleIds = hidden
        .filter((h) => h.entityType === ModerationEntityType.ROLE)
        .map((h) => h.entityId);
      let companyIds = hidden
        .filter((h) => h.entityType === ModerationEntityType.COMPANY)
        .map((h) => h.entityId);

      if (hasSearch) {
        const expanded = await getExpandedSearchEntityIds(ctx.db, search);
        if (
          expanded.companyIds.size === 0 &&
          expanded.roleIds.size === 0 &&
          expanded.reviewIds.size === 0
        ) {
          return {
            items: [],
            counts: {
              reviews: 0,
              roles: 0,
              companies: 0,
            },
          };
        }
        reviewIds = filterIdsBySearchExpansion(reviewIds, expanded, "review");
        roleIds = filterIdsBySearchExpansion(roleIds, expanded, "role");
        companyIds = filterIdsBySearchExpansion(
          companyIds,
          expanded,
          "company",
        );
      }

      if (
        reviewIds.length === 0 &&
        roleIds.length === 0 &&
        companyIds.length === 0
      ) {
        return {
          items: [],
          counts: {
            reviews: 0,
            roles: 0,
            companies: 0,
          },
        };
      }

      const [reviews, roles, companies] = await Promise.all([
        fetchWhenIdsPresent(reviewIds, () =>
          ctx.db.query.Review.findMany({
            orderBy: desc(Review.createdAt),
            where: (review, { inArray }) => inArray(review.id, reviewIds),
            limit: limitPerType,
          }),
        ),
        fetchWhenIdsPresent(roleIds, () =>
          ctx.db.query.Role.findMany({
            orderBy: desc(Role.createdAt),
            where: (role, { inArray }) => inArray(role.id, roleIds),
            limit: limitPerType,
          }),
        ),
        fetchWhenIdsPresent(companyIds, () =>
          ctx.db.query.Company.findMany({
            orderBy: desc(Company.createdAt),
            where: (company, { inArray }) => inArray(company.id, companyIds),
            limit: limitPerType,
          }),
        ),
      ]);

      const flags: ModerationFlags = {
        flagged: () => false,
        hidden: () => true,
      };

      const reviewItems = reviews.map((review) => mapReviewItem(review, flags));
      const roleItems = roles.map((role) => mapRoleItem(role, flags));
      const companyItems = companies.map((company) =>
        mapCompanyItem(company, flags),
      );

      const items = sortByCreatedAtDesc([
        ...reviewItems,
        ...roleItems,
        ...companyItems,
      ]);

      return {
        items,
        counts: {
          reviews: reviews.length,
          roles: roles.length,
          companies: companies.length,
        },
      };
    }),
  reportedDashboardItems: protectedProcedure
    .input(
      z
        .object({
          limitPerType: z.number().min(1).max(100).default(20),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;
      const search = input?.search?.trim() ?? "";
      const hasSearch = search.length > 0;

      const reports = await ctx.db.query.Report.findMany({
        orderBy: desc(Report.createdAt),
      });

      let reviewIds = [
        ...new Set(
          reports
            .map((r) => r.reviewId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      let roleIds = [
        ...new Set(
          reports
            .map((r) => r.roleId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      let companyIds = [
        ...new Set(
          reports
            .map((r) => r.companyId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];

      if (hasSearch) {
        const expanded = await getExpandedSearchEntityIds(ctx.db, search);
        if (
          expanded.companyIds.size === 0 &&
          expanded.roleIds.size === 0 &&
          expanded.reviewIds.size === 0
        ) {
          return {
            items: [],
            counts: {
              reviews: 0,
              roles: 0,
              companies: 0,
            },
          };
        }
        reviewIds = filterIdsBySearchExpansion(reviewIds, expanded, "review");
        roleIds = filterIdsBySearchExpansion(roleIds, expanded, "role");
        companyIds = filterIdsBySearchExpansion(
          companyIds,
          expanded,
          "company",
        );
      }

      if (
        reviewIds.length === 0 &&
        roleIds.length === 0 &&
        companyIds.length === 0
      ) {
        return {
          items: [],
          counts: {
            reviews: 0,
            roles: 0,
            companies: 0,
          },
        };
      }

      const [reviews, roles, companies] = await Promise.all([
        fetchWhenIdsPresent(reviewIds, () =>
          ctx.db.query.Review.findMany({
            orderBy: desc(Review.createdAt),
            where: (review, { inArray }) => inArray(review.id, reviewIds),
            limit: limitPerType,
          }),
        ),
        fetchWhenIdsPresent(roleIds, () =>
          ctx.db.query.Role.findMany({
            orderBy: desc(Role.createdAt),
            where: (role, { inArray }) => inArray(role.id, roleIds),
            limit: limitPerType,
          }),
        ),
        fetchWhenIdsPresent(companyIds, () =>
          ctx.db.query.Company.findMany({
            orderBy: desc(Company.createdAt),
            where: (company, { inArray }) => inArray(company.id, companyIds),
            limit: limitPerType,
          }),
        ),
      ]);

      const [flaggedRecords, hiddenRecords] = await Promise.all([
        ctx.db.query.Flagged.findMany({
          where: eq(Flagged.isActive, true),
        }),
        ctx.db.query.Hidden.findMany({
          where: eq(Hidden.isActive, true),
        }),
      ]);

      const flaggedKeys = new Set(
        flaggedRecords.map((record) =>
          moderationKey(record.entityType, record.entityId),
        ),
      );
      const hiddenKeys = new Set(
        hiddenRecords.map((record) =>
          moderationKey(record.entityType, record.entityId),
        ),
      );

      const flags: ModerationFlags = {
        flagged: (entityType, entityId) =>
          flaggedKeys.has(moderationKey(entityType, entityId)),
        hidden: (entityType, entityId) =>
          hiddenKeys.has(moderationKey(entityType, entityId)),
      };

      const reviewItems = reviews.map((review) => mapReviewItem(review, flags));
      const roleItems = roles.map((role) => mapRoleItem(role, flags));
      const companyItems = companies.map((company) =>
        mapCompanyItem(company, flags),
      );

      const items = sortByCreatedAtDesc([
        ...reviewItems,
        ...roleItems,
        ...companyItems,
      ]);

      return {
        items,
        counts: {
          reviews: reviews.length,
          roles: roles.length,
          companies: companies.length,
        },
      };
    }),
  setFlaggedStatus: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(
          Object.values(ModerationEntityType) as [
            ModerationEntityTypeType,
            ...ModerationEntityTypeType[],
          ],
        ),
        entityId: z.string().uuid(),
        flagged: z.boolean(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Flagged.findFirst({
        where: and(
          eq(Flagged.entityType, input.entityType),
          eq(Flagged.entityId, sql`${input.entityId}::uuid`),
          eq(Flagged.isActive, true),
        ),
      });

      if (input.flagged) {
        if (!existing) {
          await ctx.db.insert(Flagged).values({
            entityType: input.entityType,
            entityId: input.entityId,
            description:
              input.description?.trim() ?? "Flagged from admin dashboard",
            adminId: ctx.session.user.id,
          });
        }
      } else {
        await ctx.db
          .update(Flagged)
          .set({
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedByAdminId: ctx.session.user.id,
          })
          .where(
            and(
              eq(Flagged.entityId, sql`${input.entityId}::uuid`),
              eq(Flagged.isActive, true),
            ),
          );
      }

      return { success: true };
    }),
  setHiddenStatus: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(
          Object.values(ModerationEntityType) as [
            ModerationEntityTypeType,
            ...ModerationEntityTypeType[],
          ],
        ),
        entityId: z.string().uuid(),
        hidden: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Hidden.findFirst({
        where: and(
          eq(Hidden.entityType, input.entityType),
          eq(Hidden.entityId, input.entityId),
          eq(Hidden.isActive, true),
        ),
      });

      await ctx.db.transaction(async (tx) => {
        if (input.hidden) {
          if (input.entityType === ModerationEntityType.REVIEW) {
            await tx.execute(
              sql`UPDATE "review" SET "hidden" = true WHERE "id" = ${input.entityId}::uuid`,
            );
          } else if (input.entityType === ModerationEntityType.ROLE) {
            await tx.execute(
              sql`UPDATE "role" SET "hidden" = true WHERE "id" = ${input.entityId}::uuid`,
            );
          } else {
            await tx.execute(
              sql`UPDATE "company" SET "hidden" = true WHERE "id" = ${input.entityId}::uuid`,
            );
          }

          if (!existing) {
            await tx.insert(Hidden).values({
              entityType: input.entityType,
              entityId: input.entityId,
              adminId: ctx.session.user.id,
            });
          }

          return;
        }

        await tx
          .update(Hidden)
          .set({
            isActive: false,
            deactivatedAt: sql`now()`,
            deactivatedByAdminId: ctx.session.user.id,
          })
          .where(
            and(eq(Hidden.entityId, input.entityId), eq(Hidden.isActive, true)),
          );

        if (input.entityType === ModerationEntityType.REVIEW) {
          await tx.execute(
            sql`UPDATE "review" SET "hidden" = false WHERE "id" = ${input.entityId}::uuid`,
          );
        } else if (input.entityType === ModerationEntityType.ROLE) {
          await tx.execute(
            sql`UPDATE "role" SET "hidden" = false WHERE "id" = ${input.entityId}::uuid`,
          );
        } else {
          await tx.execute(
            sql`UPDATE "company" SET "hidden" = false WHERE "id" = ${input.entityId}::uuid`,
          );
        }
      });

      return { success: true };
    }),
  userManagerItems: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(500).default(200),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 200;
      const users = await ctx.db.query.User.findMany({
        orderBy: desc(User.createdAt),
        limit,
      });

      return {
        items: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isDisabled: user.isDisabled,
          createdAt: user.createdAt,
        })),
      };
    }),
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.nativeEnum(UserRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(User)
        .set({ role: input.role })
        .where(eq(User.id, input.userId));

      return { success: true };
    }),
  updateUserDisabled: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        isDisabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(User)
        .set({ isDisabled: input.isDisabled })
        .where(eq(User.id, input.userId));

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
