import type { TRPCRouterRecord } from "@trpc/server";
import Fuse from "fuse.js";
import { z } from "zod";

import { and, desc, eq } from "@cooper/db";
import { CreateReviewSchema, Review } from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const reviewRouter = {
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        options: z
          .object({
            cycle: z.enum(["SPRING", "FALL", "SUMMER"]).optional(),
            term: z.enum(["INPERSON", "HYBRID", "REMOTE"]).optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { options } = input;

      const conditions = [
        options?.cycle && eq(Review.workTerm, options.cycle),
        options?.term && eq(Review.workEnvironment, options.term),
      ].filter(Boolean);

      const reviews = await ctx.db.query.Review.findMany({
        orderBy: desc(Review.id),
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });

      if (!input.search) {
        return reviews;
      }

      const fuseOptions = {
        keys: ["reviewHeadline", "textReview", "location"],
      };

      const fuse = new Fuse(reviews, fuseOptions);

      return fuse.search(input.search).map((result) => result.item);
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
