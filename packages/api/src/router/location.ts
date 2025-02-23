import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../trpc";
import { asc } from "@cooper/db";

// doesn't work yet bc the schema is on my other laptop :D
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
        where: (loc) => loc.city.startsWith(input.prefix),
        orderBy: 
      });
    }),

create: protectedProcedure
    .input(CreateLocationSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Location).values(input);
    }),
} satisfies TRPCRouterRecord;
