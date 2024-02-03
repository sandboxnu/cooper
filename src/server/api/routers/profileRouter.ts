import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.profile.findMany();
  }),
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.profile.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        major: z.string(),
        minor: z.string().optional(),
        // TODO: Update this to something more robust
        graduationYear: z.number().min(2024).max(2030),
        graduationMonth: z.number().min(1).max(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.profile.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          major: input.major,
          minor: input.minor,
          graduationYear: input.graduationYear,
          graduationMonth: input.graduationMonth,
          userId: ctx.session.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          major: z.string().optional(),
          minor: z.string().optional(),
          // TODO: Update this to something more robust
          graduationYear: z.number().min(2024).max(2030).optional(),
          graduationMonth: z.number().min(1).max(12).optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.profile.update({
        where: {
          id: input.id,
        },
        data: {
          ...input.data,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.profile.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
