import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.review.findMany();
  }),
  getByRole: publicProcedure
    .input(
      z.object({
        roleId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.role.findUnique({
        where: {
          id: input.roleId,
        },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Role with ID ${input.roleId} not found.`,
        });
      }

      return await ctx.db.review.findMany({
        where: {
          roleId: input.roleId,
        },
      });
    }),
  getByCompany: publicProcedure
    .input(
      z.object({
        companyId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.company.findUnique({
        where: {
          id: input.companyId,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Company with ID ${input.companyId} not found.`,
        });
      }

      return await ctx.db.review.findMany({
        where: {
          companyId: input.companyId,
        },
      });
    }),
  getByProfile: publicProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.profile.findUnique({
        where: {
          id: input.profileId,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Profile with ID ${input.profileId} not found.`,
        });
      }

      return await ctx.db.review.findMany({
        where: {
          profileId: input.profileId,
        },
      });
    }),
});
