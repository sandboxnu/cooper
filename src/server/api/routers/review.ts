import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getByCompanySchema, getByIdSchema } from "~/schema/misc";
import {
  createReviewSchema,
  getByProfileSchema,
  getByRoleSchema,
  updateReviewSchema,
} from "~/schema/review";
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
    .input(getByRoleSchema)
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
    .input(getByCompanySchema)
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
    .input(getByProfileSchema)
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
    .input(createReviewSchema)
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

      if (!profile)
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
    .input(updateReviewSchema)
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
    .input(getByIdSchema)
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
