import { WorkEnvironment, WorkTerm } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
  create: protectedProcedure
    .input(
      z.object({
        workTerm: z.nativeEnum(WorkTerm),
        workYear: z.number(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        hourlyPay: z.number().min(0),
        interviewDifficulty: z.number().min(1).max(5).optional(),
        interviewExperience: z.number().min(1).max(5).optional(),
        supervisorRating: z.number().min(1).max(5).optional(),
        cultureRating: z.number().min(1).max(5).optional(),
        overallRating: z.number().min(1).max(5),
        textReview: z.string(),
        workEnvironment: z.nativeEnum(WorkEnvironment),
        freeLunch: z.boolean(),
        drugTest: z.boolean(),
        federalHolidays: z.boolean(),
        overtimeNormal: z.boolean(),
        roleId: z.string(),
        profileId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.role.findUnique({
        where: {
          id: input.roleId,
        },
      });

      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Role with ID ${input.roleId} not found.`,
        });

      const profile = await ctx.db.role.findUnique({
        where: {
          id: input.profileId,
        },
      });

      if (!role)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Profile with ID ${input.profileId} not found.`,
        });

      return await ctx.db.review.create({
        data: {
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          /**
           * TODO: Move schemas to a seperate file and set update schema as a
           * partial of the create schema
           */
          workTerm: z.nativeEnum(WorkTerm).optional(),
          workYear: z.number().optional(),
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
          hourlyPay: z.number().min(0).optional(),
          interviewDifficulty: z.number().min(1).max(5).optional(),
          interviewExperience: z.number().min(1).max(5).optional(),
          supervisorRating: z.number().min(1).max(5).optional(),
          cultureRating: z.number().min(1).max(5).optional(),
          overallRating: z.number().min(1).max(5).optional(),
          textReview: z.string().optional(),
          workEnvironment: z.nativeEnum(WorkEnvironment).optional(),
          freeLunch: z.boolean().optional(),
          drugTest: z.boolean().optional(),
          federalHolidays: z.boolean().optional(),
          overtimeNormal: z.boolean().optional(),
          roleId: z.string().optional(),
          profileId: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.review.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!review)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Review with ID ${input.id} not found.`,
        });

      return await ctx.db.review.update({
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
      const review = await ctx.db.review.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!review)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Review with ID ${input.id} not found.`,
        });

      return await ctx.db.review.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
