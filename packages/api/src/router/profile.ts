import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@cooper/db";
import { CreateProfileSchema, Profile } from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const profileRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Profile.findMany({
      orderBy: desc(Profile.id),
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Profile.findFirst({
        where: eq(Profile.id, input.id),
      });
    }),

  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Profile.findFirst({
      where: eq(Profile.userId, ctx.session.user.id),
    });
  }),

  create: protectedProcedure
    .input(CreateProfileSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Profile).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Profile).where(eq(Profile.id, input));
  }),
} satisfies TRPCRouterRecord;
