import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getByCompanySchema, getByIdSchema } from "~/schema/misc";
import {
  createRoleSchema,
  getByTitleSchema,
  updateRoleSchema,
} from "~/schema/role";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const roleRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.role.findMany();
  }),
  getById: publicProcedure
    .input(getByIdSchema)
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.role.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Role with ID ${input.id} not found.`,
        });
      }

      return role;
    }),
  getByTitle: publicProcedure
    .input(getByTitleSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.role.findMany({
        where: {
          title: input.title,
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
        include: {
          roles: true,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Company with ID ${input.companyId} not found.`,
        });
      }

      return company.roles;
    }),
  create: protectedProcedure
    .input(createRoleSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.role.create({
        data: {
          ...input,
        },
      });
    }),
  update: protectedProcedure
    .input(updateRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.role.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Role with ID ${input.id} not found.`,
        });
      }

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
    .input(getByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.role.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Role with ID ${input.id} not found.`,
        });
      }

      return await ctx.db.role.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
