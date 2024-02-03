import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const roleRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.role.findMany();
  }),
  getByTitle: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.role.findMany({
        where: {
          title: input.title,
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
        include: {
          roles: true,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Company with ID ${input.companyId} not found`,
        });
      }

      return company.roles;
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.role.create({
        data: {
          title: input.title,
          description: input.description,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.role.update({
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
      return await ctx.db.role.delete({
        where: {
          id: input.id,
        },
      });
    }),
});