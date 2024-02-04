import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Industry } from "@prisma/client";

export const companyRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
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
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.company.delete({
        where: {
          id: input.id,
        },
      });
    }),
  create: protectedProcedure
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          industry: z.nativeEnum(Industry).optional(),
          location: z.string().optional(),
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
