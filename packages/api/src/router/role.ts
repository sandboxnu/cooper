import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { ReviewType } from "@cooper/db/schema";
import { asc, desc, eq } from "@cooper/db";
import { CreateRoleSchema, Review, Role } from "@cooper/db/schema";

import {
  protectedProcedure,
  sortableProcedure,
  publicProcedure,
} from "../trpc";

const ordering = {
  default: desc(Role.id),
  newest: desc(Role.createdAt),
  oldest: asc(Role.createdAt),
};

export const roleRouter = {
  list: sortableProcedure.query(async ({ ctx }) => {
    if (ctx.sortBy === "rating") {
      const roles = await ctx.db.query.Role.findMany();

      const rolesWithRatings = await Promise.all(
        roles.map(async (role) => {
          const reviews = await ctx.db.query.Review.findMany({
            where: eq(Review.roleId, role.id),
          });
          const avgRating =
            reviews.length > 0
              ? reviews.reduce(
                  (sum, review) => sum + Number(review.overallRating),
                  0,
                ) / reviews.length
              : 0;
          return { role, avgRating };
        }),
      );
      return rolesWithRatings
        .sort((a, b) => b.avgRating - a.avgRating)
        .map(({ role }) => role);
    }
    return ctx.db.query.Role.findMany({
      orderBy: ordering[ctx.sortBy || "default"],
    });
  }),

  getByTitle: sortableProcedure
    .input(z.object({ title: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.sortBy === "rating") {
        const roles = await ctx.db.query.Role.findMany({
          where: eq(Role.title, input.title),
        });
        const rolesWithRatings = await Promise.all(
          roles.map(async (role) => {
            const reviews = await ctx.db.query.Review.findMany({
              where: eq(Review.roleId, role.id),
            });
            const avgRating =
              reviews.length > 0
                ? reviews.reduce(
                    (sum, review) => sum + Number(review.overallRating),
                    0,
                  ) / reviews.length
                : 0;
            return { role, avgRating };
          }),
        );
        return rolesWithRatings
          .sort((a, b) => b.avgRating - a.avgRating)
          .map(({ role }) => role);
      }
      return ctx.db.query.Role.findMany({
        where: eq(Role.title, input.title),
        orderBy: ordering[ctx.sortBy || "default"],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findFirst({
        where: eq(Role.id, input.id),
      });
    }),

  getByCompany: sortableProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.sortBy === "rating") {
        const roles = await ctx.db.query.Role.findMany({
          where: eq(Role.companyId, input.companyId),
        });
        const rolesWithRatings = await Promise.all(
          roles.map(async (role) => {
            const reviews = await ctx.db.query.Review.findMany({
              where: eq(Review.roleId, role.id),
            });
            const avgRating =
              reviews.length > 0
                ? reviews.reduce(
                    (sum, review) => sum + Number(review.overallRating),
                    0,
                  ) / reviews.length
                : 0;
            return { role, avgRating };
          }),
        );
        return rolesWithRatings
          .sort((a, b) => b.avgRating - a.avgRating)
          .map(({ role }) => role);
      }
      return ctx.db.query.Role.findMany({
        where: eq(Role.companyId, input.companyId),
        orderBy: ordering[ctx.sortBy || "default"],
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

  getAverageById: sortableProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.sortBy === "rating") {
        const roles = await ctx.db.query.Role.findMany({
          where: eq(Role.id, input.roleId),
        });
        const rolesWithRatings = await Promise.all(
          roles.map(async (role) => {
            const reviews = await ctx.db.query.Review.findMany({
              where: eq(Review.roleId, role.id),
            });
            const avgRating =
              reviews.length > 0
                ? reviews.reduce(
                    (sum, review) => sum + Number(review.overallRating),
                    0,
                  ) / reviews.length
                : 0;
            return { role, avgRating };
          }),
        );
        return rolesWithRatings
          .sort((a, b) => b.avgRating - a.avgRating)
          .map(({ role }) => role);
      }
      const reviews = await ctx.db.query.Review.findMany({
        where: eq(Review.roleId, input.roleId),
        orderBy: ordering[ctx.sortBy || "default"],
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

      const minPay = Math.min(
        ...reviews.map((review) => Number(review.hourlyPay)),
      );
      const maxPay = Math.max(
        ...reviews.map((review) => Number(review.hourlyPay)),
      );

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
