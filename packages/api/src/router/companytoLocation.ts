import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@cooper/db";
import {
  CompaniesToLocations,
  CreateCompanyToLocationSchema,
  Location,
} from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const companyToLocationRouter = {
  create: protectedProcedure
    .input(CreateCompanyToLocationSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(CompaniesToLocations).values(input);
    }),

  getLocationsByCompanyId: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const locations = await ctx.db
        .select()
        .from(CompaniesToLocations)
        .leftJoin(Location, eq(CompaniesToLocations.locationId, Location.id))
        .where(eq(CompaniesToLocations.companyId, input.companyId));
      return locations;
    }),
} satisfies TRPCRouterRecord;
