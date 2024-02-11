import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createCompanySchema, updateCompanySchema } from "~/schema/company";
import { getByIdSchema, getByNameSchema } from "~/schema/misc";

export const companyRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.company.findMany();
  }),
  getByName: publicProcedure.input(getByNameSchema).query(({ ctx, input }) => {
    return ctx.db.company.findFirst({
      where: {
        name: input.name,
      },
    });
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
    .mutation(({ ctx, input }) => {
      return ctx.db.company.update({
        where: {
          id: input.id,
        },
        data: {
          ...input.data,
        },
      });
    }),
  delete: protectedProcedure.input(getByIdSchema).mutation(({ ctx, input }) => {
    return ctx.db.company.delete({
      where: {
        id: input.id,
      },
    });
  }),
});
