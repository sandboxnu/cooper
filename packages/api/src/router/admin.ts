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
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;

      const flagged = await ctx.db.query.Flagged.findMany({
        orderBy: desc(Flagged.createdAt),
        where: eq(Flagged.isActive, true),
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
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limitPerType = input?.limitPerType ?? 20;

      const hidden = await ctx.db.query.Hidden.findMany({
        orderBy: desc(Hidden.createdAt),
        where: eq(Hidden.isActive, true),
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
          .set({ isActive: false })
          .where(
            and(
              eq(Flagged.entityType, input.entityType),
              eq(Flagged.entityId, input.entityId),
              eq(Flagged.isActive, true),
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
          eq(Hidden.isActive, true),
        ),
      });

      if (input.hidden) {
        if (!existing) {
          await ctx.db.insert(Hidden).values({
            entityType: input.entityType,
            entityId: input.entityId,
            description:
              input.description?.trim() ?? "Hidden from admin dashboard",
            adminId: ctx.session.user.id,
          });
        }
      } else {
        await ctx.db
          .update(Hidden)
          .set({ isActive: false })
          .where(
            and(
              eq(Hidden.entityType, input.entityType),
              eq(Hidden.entityId, input.entityId),
              eq(Hidden.isActive, true),
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
