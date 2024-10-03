import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@cooper/db";
import { CreateReviewSchema, Review } from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const reviewRouter = {
  list: publicProcedure
    .input(
      z.object({
        options: z
          .object({
            cycle: z.enum(["SPRING", "FALL", "SUMMER"]).optional(),
            term: z.enum(["INPERSON", "HYBRID", "REMOTE"]).optional(),
          })
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        orderBy: desc(Review.id),
        where: input.options?.term // if there's a term
          ? input.options.cycle // if there's a cycle and term
            ? and(
                eq(Review.workTerm, input.options.cycle),
                eq(Review.workEnvironment, input.options.term),
              )
            : eq(Review.workEnvironment, input.options.term) // if there's just a term
          : input.options?.cycle
            ? eq(Review.workTerm, input.options.cycle)
            : undefined, // just a cycle or none of the above
      });
    }),

  getByRole: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: eq(Review.roleId, input.id),
      });
    }),

  getByCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: eq(Review.companyId, input.id),
      });
    }),

  getByProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: eq(Review.profileId, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreateReviewSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Review).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Review).where(eq(Review.id, input));
  }),
} satisfies TRPCRouterRecord;
