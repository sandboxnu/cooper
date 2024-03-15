import { TRPCError } from "@trpc/server";
import { getByIdSchema } from "~/schema/misc";
import { createProfileSchema, updateProfileSchema } from "~/schema/profile";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.profile.findMany();
  }),
  getById: publicProcedure
    .input(getByIdSchema)
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
    const profile = await ctx.db.profile.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Profile for user ${ctx.session.user.id} not found.`,
      });
    }

    return profile;
  }),
  create: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.profile.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(updateProfileSchema)
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
    .input(getByIdSchema)
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
