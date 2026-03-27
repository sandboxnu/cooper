import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@cooper/db";
import {
  Company,
  Flagged,
  Hidden,
  ModerationEntityType,
  Report,
  Review,
  Role,
  User,
} from "@cooper/db/schema";

import { protectedProcedure } from "../trpc";

export const adminRouter = {
  dashboardItems: protectedProcedure
    .input(
      z
        .object({
          limitPerType: z.number().min(1).max(100).default(20),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;

      const [reviews, roles, companies] = await Promise.all([
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

      const [flaggedRecords, hiddenRecords] = await Promise.all([
        ctx.db.query.Flagged.findMany(),
        ctx.db.query.Hidden.findMany(),
      ]);

      const flaggedKeys = new Set(
        flaggedRecords.map(
          (record) => `${record.entityType}:${record.entityId}`,
        ),
      );
      const hiddenKeys = new Set(
        hiddenRecords.map(
          (record) => `${record.entityType}:${record.entityId}`,
        ),
      );

      const reviewItems = reviews.map((review) => ({
        type: "review" as const,
        id: review.id,
        createdAt: review.createdAt,
        headline: review.reviewHeadline,
        text: review.textReview,
        flagged: flaggedKeys.has(`${ModerationEntityType.REVIEW}:${review.id}`),
        hidden: hiddenKeys.has(`${ModerationEntityType.REVIEW}:${review.id}`),
      }));

      const roleItems = roles.map((role) => ({
        type: "role" as const,
        id: role.id,
        createdAt: role.createdAt,
        title: role.title,
        companyId: role.companyId,
        flagged: flaggedKeys.has(`${ModerationEntityType.ROLE}:${role.id}`),
        hidden: hiddenKeys.has(`${ModerationEntityType.ROLE}:${role.id}`),
      }));

      const companyItems = companies.map((company) => ({
        type: "company" as const,
        id: company.id,
        createdAt: company.createdAt,
        name: company.name,
        flagged: flaggedKeys.has(
          `${ModerationEntityType.COMPANY}:${company.id}`,
        ),
        hidden: hiddenKeys.has(`${ModerationEntityType.COMPANY}:${company.id}`),
      }));

      const items = [...reviewItems, ...roleItems, ...companyItems].sort(
        (a, b) => {
          const aTime =
            a.createdAt instanceof Date
              ? a.createdAt.getTime()
              : new Date(a.createdAt as unknown as string).getTime();
          const bTime =
            b.createdAt instanceof Date
              ? b.createdAt.getTime()
              : new Date(b.createdAt as unknown as string).getTime();

          return bTime - aTime;
        },
      );

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
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;

      const flagged = await ctx.db.query.Flagged.findMany({
        orderBy: desc(Flagged.createdAt),
      });

      const reviewIds = flagged
        .filter((f) => f.entityType === ModerationEntityType.REVIEW)
        .map((f) => f.entityId);
      const roleIds = flagged
        .filter((f) => f.entityType === ModerationEntityType.ROLE)
        .map((f) => f.entityId);
      const companyIds = flagged
        .filter((f) => f.entityType === ModerationEntityType.COMPANY)
        .map((f) => f.entityId);

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
        reviewIds.length > 0
          ? ctx.db.query.Review.findMany({
              orderBy: desc(Review.createdAt),
              where: (review, { inArray }) => inArray(review.id, reviewIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
        roleIds.length > 0
          ? ctx.db.query.Role.findMany({
              orderBy: desc(Role.createdAt),
              where: (role, { inArray }) => inArray(role.id, roleIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
        companyIds.length > 0
          ? ctx.db.query.Company.findMany({
              orderBy: desc(Company.createdAt),
              where: (company, { inArray }) => inArray(company.id, companyIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
      ]);

      const reviewItems = reviews.map((review) => ({
        type: "review" as const,
        id: review.id,
        createdAt: review.createdAt,
        headline: review.reviewHeadline,
        text: review.textReview,
        flagged: true,
        hidden: false,
      }));

      const roleItems = roles.map((role) => ({
        type: "role" as const,
        id: role.id,
        createdAt: role.createdAt,
        title: role.title,
        companyId: role.companyId,
        flagged: true,
        hidden: false,
      }));

      const companyItems = companies.map((company) => ({
        type: "company" as const,
        id: company.id,
        createdAt: company.createdAt,
        name: company.name,
        flagged: true,
        hidden: false,
      }));

      const items = [...reviewItems, ...roleItems, ...companyItems].sort(
        (a, b) => {
          const aTime =
            a.createdAt instanceof Date
              ? a.createdAt.getTime()
              : new Date(a.createdAt as unknown as string).getTime();
          const bTime =
            b.createdAt instanceof Date
              ? b.createdAt.getTime()
              : new Date(b.createdAt as unknown as string).getTime();

          return bTime - aTime;
        },
      );

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
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;

      const hidden = await ctx.db.query.Hidden.findMany({
        orderBy: desc(Hidden.createdAt),
      });

      const reviewIds = hidden
        .filter((h) => h.entityType === ModerationEntityType.REVIEW)
        .map((h) => h.entityId);
      const roleIds = hidden
        .filter((h) => h.entityType === ModerationEntityType.ROLE)
        .map((h) => h.entityId);
      const companyIds = hidden
        .filter((h) => h.entityType === ModerationEntityType.COMPANY)
        .map((h) => h.entityId);

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
        reviewIds.length > 0
          ? ctx.db.query.Review.findMany({
              orderBy: desc(Review.createdAt),
              where: (review, { inArray }) => inArray(review.id, reviewIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
        roleIds.length > 0
          ? ctx.db.query.Role.findMany({
              orderBy: desc(Role.createdAt),
              where: (role, { inArray }) => inArray(role.id, roleIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
        companyIds.length > 0
          ? ctx.db.query.Company.findMany({
              orderBy: desc(Company.createdAt),
              where: (company, { inArray }) => inArray(company.id, companyIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
      ]);

      const reviewItems = reviews.map((review) => ({
        type: "review" as const,
        id: review.id,
        createdAt: review.createdAt,
        headline: review.reviewHeadline,
        text: review.textReview,
        flagged: false,
        hidden: true,
      }));

      const roleItems = roles.map((role) => ({
        type: "role" as const,
        id: role.id,
        createdAt: role.createdAt,
        title: role.title,
        companyId: role.companyId,
        flagged: false,
        hidden: true,
      }));

      const companyItems = companies.map((company) => ({
        type: "company" as const,
        id: company.id,
        createdAt: company.createdAt,
        name: company.name,
        flagged: false,
        hidden: true,
      }));

      const items = [...reviewItems, ...roleItems, ...companyItems].sort(
        (a, b) => {
          const aTime =
            a.createdAt instanceof Date
              ? a.createdAt.getTime()
              : new Date(a.createdAt as unknown as string).getTime();
          const bTime =
            b.createdAt instanceof Date
              ? b.createdAt.getTime()
              : new Date(b.createdAt as unknown as string).getTime();

          return bTime - aTime;
        },
      );

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
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;

      const reports = await ctx.db.query.Report.findMany({
        orderBy: desc(Report.createdAt),
      });

      const reviewIds = [
        ...new Set(
          reports
            .map((r) => r.reviewId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const roleIds = [
        ...new Set(
          reports
            .map((r) => r.roleId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const companyIds = [
        ...new Set(
          reports
            .map((r) => r.companyId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];

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
        reviewIds.length > 0
          ? ctx.db.query.Review.findMany({
              orderBy: desc(Review.createdAt),
              where: (review, { inArray }) => inArray(review.id, reviewIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
        roleIds.length > 0
          ? ctx.db.query.Role.findMany({
              orderBy: desc(Role.createdAt),
              where: (role, { inArray }) => inArray(role.id, roleIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
        companyIds.length > 0
          ? ctx.db.query.Company.findMany({
              orderBy: desc(Company.createdAt),
              where: (company, { inArray }) => inArray(company.id, companyIds),
              limit: limitPerType,
            })
          : Promise.resolve([]),
      ]);

      const [flaggedRecords, hiddenRecords] = await Promise.all([
        ctx.db.query.Flagged.findMany(),
        ctx.db.query.Hidden.findMany(),
      ]);

      const flaggedKeys = new Set(
        flaggedRecords.map(
          (record) => `${record.entityType}:${record.entityId}`,
        ),
      );
      const hiddenKeys = new Set(
        hiddenRecords.map(
          (record) => `${record.entityType}:${record.entityId}`,
        ),
      );

      const reviewItems = reviews.map((review) => ({
        type: "review" as const,
        id: review.id,
        createdAt: review.createdAt,
        headline: review.reviewHeadline,
        text: review.textReview,
        flagged: flaggedKeys.has(`${ModerationEntityType.REVIEW}:${review.id}`),
        hidden: hiddenKeys.has(`${ModerationEntityType.REVIEW}:${review.id}`),
      }));

      const roleItems = roles.map((role) => ({
        type: "role" as const,
        id: role.id,
        createdAt: role.createdAt,
        title: role.title,
        companyId: role.companyId,
        flagged: flaggedKeys.has(`${ModerationEntityType.ROLE}:${role.id}`),
        hidden: hiddenKeys.has(`${ModerationEntityType.ROLE}:${role.id}`),
      }));

      const companyItems = companies.map((company) => ({
        type: "company" as const,
        id: company.id,
        createdAt: company.createdAt,
        name: company.name,
        flagged: flaggedKeys.has(
          `${ModerationEntityType.COMPANY}:${company.id}`,
        ),
        hidden: hiddenKeys.has(`${ModerationEntityType.COMPANY}:${company.id}`),
      }));

      const items = [...reviewItems, ...roleItems, ...companyItems].sort(
        (a, b) => {
          const aTime =
            a.createdAt instanceof Date
              ? a.createdAt.getTime()
              : new Date(a.createdAt as unknown as string).getTime();
          const bTime =
            b.createdAt instanceof Date
              ? b.createdAt.getTime()
              : new Date(b.createdAt as unknown as string).getTime();

          return bTime - aTime;
        },
      );

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
        entityType: z.nativeEnum(ModerationEntityType),
        entityId: z.string().uuid(),
        flagged: z.boolean(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Flagged.findFirst({
        where: and(
          eq(Flagged.entityType, input.entityType),
          eq(Flagged.entityId, input.entityId),
        ),
      });

      if (input.flagged) {
        if (!existing) {
          await ctx.db.insert(Flagged).values({
            entityType: input.entityType,
            entityId: input.entityId,
            description:
              input.description?.trim() || "Flagged from admin dashboard",
            adminId: ctx.session.user.id,
          });
        }
      } else if (existing) {
        await ctx.db
          .delete(Flagged)
          .where(
            and(
              eq(Flagged.entityType, input.entityType),
              eq(Flagged.entityId, input.entityId),
            ),
          );
      }

      return { success: true };
    }),
  setHiddenStatus: protectedProcedure
    .input(
      z.object({
        entityType: z.nativeEnum(ModerationEntityType),
        entityId: z.string().uuid(),
        hidden: z.boolean(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Hidden.findFirst({
        where: and(
          eq(Hidden.entityType, input.entityType),
          eq(Hidden.entityId, input.entityId),
        ),
      });

      if (input.hidden) {
        if (!existing) {
          await ctx.db.insert(Hidden).values({
            entityType: input.entityType,
            entityId: input.entityId,
            description:
              input.description?.trim() || "Hidden from admin dashboard",
            adminId: ctx.session.user.id,
          });
        }
      } else if (existing) {
        await ctx.db
          .delete(Hidden)
          .where(
            and(
              eq(Hidden.entityType, input.entityType),
              eq(Hidden.entityId, input.entityId),
            ),
          );
      }

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
          createdAt: user.createdAt,
        })),
      };
    }),
} satisfies TRPCRouterRecord;
