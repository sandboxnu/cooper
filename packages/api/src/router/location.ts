import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { asc } from "@cooper/db";
import { CreateLocationSchema, Location } from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const locationRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Location.findMany({
      orderBy: asc(Location.city),
    });
  }),

  getByPrefix: publicProcedure
    .input(z.object({ prefix: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Location.findMany({
        where: (loc, { ilike }) => ilike(loc.city, `${input.prefix}%`),
        orderBy: asc(Location.city),
      });
    }),

  create: protectedProcedure
    .input(CreateLocationSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Location).values(input);
    }),
} satisfies TRPCRouterRecord;
