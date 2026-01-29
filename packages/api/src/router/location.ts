import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { asc, desc, eq, ilike, sql } from "@cooper/db";
import {
  CompaniesToLocations,
  CreateLocationSchema,
  Location,
} from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const locationRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Location.findMany({
      orderBy: asc(Location.city),
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Location.findFirst({
        where: eq(Location.id, input.id),
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

  getByPopularity: publicProcedure
    .input(
      z
        .object({
          prefix: z.string().optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const query = ctx.db
        .select({
          id: Location.id,
          city: Location.city,
          state: Location.state,
          country: Location.country,
          companyCount: sql<number>`count(${CompaniesToLocations.companyId})`,
        })
        .from(Location)
        .leftJoin(
          CompaniesToLocations,
          eq(Location.id, CompaniesToLocations.locationId),
        );

      if (input?.prefix) {
        query.where(ilike(Location.city, `${input.prefix}%`));
      }

      return query
        .groupBy(Location.id, Location.city, Location.state)
        .having(sql`count(${CompaniesToLocations.companyId}) >= 0`)
        .orderBy(desc(sql`count(${CompaniesToLocations.companyId})`));
    }),
} satisfies TRPCRouterRecord;
