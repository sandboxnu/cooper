import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@cooper/db";
import { CreateRoleSchema, Review, Role } from "@cooper/db/schema";

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

  getAverageById: publicProcedure
  .input(z.object({ roleId: z.string() }))
  .query(async ({ ctx, input }) => {

    const reviews = ctx.db.query.Review.findMany({
      where: eq(Review.roleId, input.roleId),
    })

    const totalReviews = (await reviews).length;

    const averageOverallRating =
      totalReviews > 0
        ? (await reviews).reduce((sum, review) => sum + review.overallRating, 0) / totalReviews
        : 0; 
    const averageHourlyPay = 
      totalReviews > 0
        ? (await reviews).reduce((sum, review) => sum + Number(review.hourlyPay), 0) / totalReviews
        : 0; 
    const averageInterviewDifficulty = 
      totalReviews > 0
        ? (await reviews).reduce((sum, review) => sum + review.interviewDifficulty, 0) / totalReviews
        : 0; 
    const averageCultureRating = 
      totalReviews > 0
        ? (await reviews).reduce((sum, review) => sum + review.cultureRating, 0) / totalReviews
        : 0; 
    const averageSupervisorRating = 
      totalReviews > 0
        ? (await reviews).reduce((sum, review) => sum + review.supervisorRating, 0) / totalReviews
        : 0; 
    const averageInterviewRating = 
      totalReviews > 0
        ? (await reviews).reduce((sum, review) => sum + review.interviewRating, 0) / totalReviews
        : 0; 

    return {
      averageOverallRating: averageOverallRating, 
      averageHourlyPay: averageHourlyPay,
      averageInterviewDifficulty: averageInterviewDifficulty,
      averageCultureRating: averageCultureRating,
      averageSupervisorRating: averageSupervisorRating,
      averageInterviewRating: averageInterviewRating
    }
  }),

} satisfies TRPCRouterRecord;
