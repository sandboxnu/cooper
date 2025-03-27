import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { ReviewType } from "@cooper/db/schema";
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
      const reviews = await ctx.db.query.Review.findMany({
        where: eq(Review.roleId, input.roleId),
      });

      const calcAvg = (field: keyof ReviewType) => {
        return totalReviews > 0
          ? reviews.reduce((sum, review) => sum + Number(review[field]), 0) /
              totalReviews
          : 0;
      };

      const calcPercentage = (field: keyof ReviewType): number => {
        return totalReviews > 0
          ? reviews.filter((review) => review[field] === true).length /
              totalReviews
          : 0;
      };

      const totalReviews = reviews.length;

      const averageOverallRating = calcAvg("overallRating");
      const averageHourlyPay = calcAvg("hourlyPay");
      const averageInterviewDifficulty = calcAvg("interviewDifficulty");
      const averageCultureRating = calcAvg("cultureRating");
      const averageSupervisorRating = calcAvg("supervisorRating");
      const averageInterviewRating = calcAvg("interviewRating");

      const federalHolidays = calcPercentage("federalHolidays");
      const drugTest = calcPercentage("drugTest");
      const freeLunch = calcPercentage("freeLunch");
      const freeMerch = calcPercentage("freeMerch");
      const freeTransportation = calcPercentage("freeTransport");
      const overtimeNormal = calcPercentage("overtimeNormal");
      const pto = calcPercentage("pto");

      const minPay = totalReviews !== 0 ? Math.min(
        ...reviews.map((review) => Number(review.hourlyPay)),
      ) : 0;
      const maxPay = totalReviews !== 0 ? Math.max(
        ...reviews.map((review) => Number(review.hourlyPay)),
      ) : 0;

      return {
        averageOverallRating: averageOverallRating,
        averageHourlyPay: averageHourlyPay,
        averageInterviewDifficulty: averageInterviewDifficulty,
        averageCultureRating: averageCultureRating,
        averageSupervisorRating: averageSupervisorRating,
        averageInterviewRating: averageInterviewRating,
        federalHolidays: federalHolidays,
        drugTest: drugTest,
        freeLunch: freeLunch,
        freeMerch: freeMerch,
        freeTransportation: freeTransportation,
        overtimeNormal: overtimeNormal,
        pto: pto,
        minPay: minPay,
        maxPay: maxPay,
      };
    }),
} satisfies TRPCRouterRecord;
