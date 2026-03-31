import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Session } from "@cooper/auth";
import { eq } from "@cooper/db";
import { Profile, Report, ReportReason } from "@cooper/db/schema";

import { protectedProcedure } from "../trpc";

export const reportRouter = {
  create: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["role", "company", "review"]),
        entityId: z.string().min(1),
        reason: z.enum(Object.values(ReportReason) as [string, ...string[]]),
        reportText: z.string().trim().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session as Session;

      const profile = await ctx.db.query.Profile.findFirst({
        where: eq(Profile.userId, session.user.id),
      });

      if (!profile) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You must complete your profile before submitting a report",
        });
      }

      const values = {
        profileId: profile.id,
        reason: input.reason,
        reportText: input.reportText,
        ...(input.entityType === "role" && { roleId: input.entityId }),
        ...(input.entityType === "company" && { companyId: input.entityId }),
        ...(input.entityType === "review" && { reviewId: input.entityId }),
      };

      return ctx.db.insert(Report).values(values);
    }),
} satisfies TRPCRouterRecord;
