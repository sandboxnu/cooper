import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const companyRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.role.findMany();
  }),
  getByTitle: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.role.findMany({
        where: {
          title: input.title,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        // TODO: Link the role to a Company
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.role.create({
        data: {
          title: input.title,
          description: input.description,
        },
      });
    }),
});
