import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Industry } from "@prisma/client";

export const companyRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.company.findMany();
  }),
  getByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.company.findFirst({
        where: {
          name: input.name,
        },
      });
    }),
  deleteByID: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      // TODO : should we delete all of the roles + reviews associated with a company?
      return ctx.db.company.delete({
        where: {
          id: input.id,
        },
      });
    }),
  postCompany: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        industry: z.nativeEnum(Industry),
        location: z.string(),
      }),
    )
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
  updateCompanyById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string(),
          description: z.string(),
          industry: z.nativeEnum(Industry),
          location: z.string(),
        }),
      }),
    )
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
});
