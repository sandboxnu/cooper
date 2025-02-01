import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq } from "@cooper/db";
import { User } from "@cooper/db/schema";

import { publicProcedure } from "../trpc";

export const userRouter = {
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.query.User.findFirst({
        where: eq(User.id, input.id),
      });
    }),
} satisfies TRPCRouterRecord;
