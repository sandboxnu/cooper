import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@cooper/db";
import { CreateRoleSchema, Role, RoleType } from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";
import { performFuseSearch } from "../utils/fuzzyHelper";


export const roleRouter = { 
  list: publicProcedure
   .input(
        z.object({
          search: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const roles = await ctx.db.query.Role.findMany({
          orderBy: desc(Role.id),
        });
  
        const fuseOptions = ["title", "description"];
        return performFuseSearch<RoleType>(
          roles,
          fuseOptions,
          input.search,
        );
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
