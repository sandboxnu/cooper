import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc } from "@cooper/db";
import { Company, Review, Role } from "@cooper/db/schema";

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

      const reviewItems = reviews.map((review) => ({
        type: "review" as const,
        id: review.id,
        createdAt: review.createdAt,
        headline: review.reviewHeadline,
        text: review.textReview,
      })); 

      const roleItems = roles.map((role) => ({
        type: "role" as const,
        id: role.id,
        createdAt: role.createdAt,
        title: role.title,
        companyId: role.companyId,
      }));

      const companyItems = companies.map((company) => ({
        type: "company" as const,
        id: company.id,
        createdAt: company.createdAt,
        name: company.name,
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
} satisfies TRPCRouterRecord;
