import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const MAX_GRADUATION_LENGTH = 6;
const MONTH_LB = 1;
const MONTH_UB = 12;
const YEAR_LB = new Date().getFullYear();
const YEAR_UB = YEAR_LB + MAX_GRADUATION_LENGTH;

export const profileRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.profile.findMany();
  }),
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.profile.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Profile with ID ${input.id} not found.`,
        });
      }

      return profile;
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
        graduationYear: z.number().min(YEAR_LB).max(YEAR_UB),
        graduationMonth: z.number().min(MONTH_LB).max(MONTH_UB),
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
          graduationYear: z.number().min(YEAR_LB).max(YEAR_UB).optional(),
          graduationMonth: z.number().min(MONTH_LB).max(MONTH_UB).optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.profile.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Profile with ID ${input.id} not found.`,
        });
      }

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
      const profile = await ctx.db.profile.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Profile with ID ${input.id} not found.`,
        });
      }

      return await ctx.db.profile.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
