import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@cooper/db";
import { Company, Review, CreateCompanySchema } from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const companyRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Company.findMany({
      orderBy: desc(Company.id),
    });
  }),

  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Company.findFirst({
        where: eq(Company.name, input.name),
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Company.findFirst({
        where: eq(Company.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreateCompanySchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Company).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Company).where(eq(Company.id, input));
  }),

  getAverageById: publicProcedure
  .input(z.object({ companyId: z.string() }))
  .query(async ({ ctx, input }) => {

    const reviews = ctx.db.query.Review.findMany({
      where: eq(Review.companyId, input.companyId),
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
