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
      return await ctx.db.review.findMany({
        where: {
          profileId: input.profileId,
        },
      });
    }),
});
