import type { TRPCRouterRecord } from "@trpc/server";

import {
  CompaniesToLocations,
  CreateCompanyToLocationSchema,
} from "@cooper/db/schema";

import { protectedProcedure } from "../trpc";

export const companyToLocationRouter = {
  create: protectedProcedure
    .input(CreateCompanyToLocationSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(CompaniesToLocations).values(input);
    }),
} satisfies TRPCRouterRecord;
