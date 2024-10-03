import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@cooper/db";
import { CreateRoleSchema, Role } from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const roleRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Role.findMany({
      orderBy: desc(Role.id),
    });
  }),

  getByTitle: publicProcedure
    .input(z.object({ title: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findMany({
        where: eq(Role.title, input.title),
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findFirst({
        where: eq(Role.id, input.id),
      });
    }),

  getByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findMany({
        where: eq(Role.companyId, input.companyId),
      });
    }),

  create: protectedProcedure
    .input(CreateRoleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Role).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Role).where(eq(Role.id, input));
  }),
} satisfies TRPCRouterRecord;
