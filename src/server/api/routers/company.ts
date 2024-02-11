import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createCompanySchema, updateCompanySchema } from "~/schema/company";
import { getByIdSchema, getByNameSchema } from "~/schema/misc";
import { TRPCError } from "@trpc/server";

export const companyRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.company.findMany();
  }),
  getByName: publicProcedure
    .input(getByNameSchema)
    .query(async ({ ctx, input }) => {
      // Ensure A Company Exists Before Getting It
      const existingCompany = await ctx.db.company.findFirst({
        where: {
          name: input.name,
        },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      return existingCompany;
    }),
  create: protectedProcedure
    .input(createCompanySchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.company.create({
        data: {
          name: input.name,
          description: input.description,
          industry: input.industry,
          location: input.location,
        },
      });
    }),
  update: protectedProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure A Company Exists Before Updating It
      const existingCompany = await ctx.db.company.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      return ctx.db.company.update({
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
      // Ensure A Company Exists Before Deleting It
      const existingCompany = await ctx.db.company.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingCompany) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      return ctx.db.company.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
