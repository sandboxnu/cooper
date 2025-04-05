import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import Fuse from "fuse.js";
import { z } from "zod";

import type { ReviewType } from "@cooper/db/schema";
import { and, desc, eq, inArray } from "@cooper/db";
import {
  CompaniesToLocations,
  Company,
  CreateReviewSchema,
  Review,
} from "@cooper/db/schema";

import {
  protectedProcedure,
  publicProcedure,
  sortableProcedure,
} from "../trpc";

export const reviewRouter = {
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        options: z
          .object({
            cycle: z.enum(["SPRING", "FALL", "SUMMER"]).optional(),
            term: z.enum(["INPERSON", "HYBRID", "REMOTE"]).optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { options } = input;

      const conditions = [
        options?.cycle && eq(Review.workTerm, options.cycle),
        options?.term && eq(Review.workEnvironment, options.term),
      ].filter(Boolean);

      const reviews = await ctx.db.query.Review.findMany({
        orderBy: desc(Review.id),
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });

      if (!input.search) {
        return reviews;
      }

      const fuseOptions = {
        keys: ["reviewHeadline", "textReview", "location"],
      };

      const fuse = new Fuse(reviews, fuseOptions);

      return fuse.search(input.search).map((result) => result.item);
    }),

  getByRole: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: eq(Review.roleId, input.id),
      });
    }),

  getByCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: eq(Review.companyId, input.id),
      });
    }),

  getByProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: eq(Review.profileId, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreateReviewSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.profileId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be logged in to leave a review",
        });
      }
      const reviews = await ctx.db.query.Review.findMany({
        where: eq(Review.profileId, input.profileId),
      });
      if (reviews.length >= 5) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You can only leave 5 reviews",
        });
      }
      const reviewsInSameCycle = reviews.filter(
        (review) =>
          review.workTerm === input.workTerm &&
          review.workYear === input.workYear,
      );
      if (reviewsInSameCycle.length >= 2) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You can only leave 2 reviews per cycle",
        });
      }

      // Check if a CompaniesToLocations object already exists with the given companyId and locationId
      const existingRelation =
        await ctx.db.query.CompaniesToLocations.findFirst({
          where: and(
            eq(CompaniesToLocations.companyId, input.companyId),
            eq(CompaniesToLocations.locationId, input.locationId ?? ""),
          ),
        });

      if (!existingRelation && input.locationId) {
        await ctx.db.insert(CompaniesToLocations).values({
          locationId: input.locationId,
          companyId: input.companyId,
        });
      }

      return ctx.db.insert(Review).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Review).where(eq(Review.id, input));
  }),

  getAverageByIndustry: sortableProcedure
    .input(z.object({ industry: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.res) {
        ctx.res.headers.set(
          "Cache-Control",
          "public, max-age=28800, s-maxage=28800, stale-while-revalidate=600",
        );
      }

      const companies = await ctx.db.query.Company.findMany({
        where: eq(Company.industry, input.industry),
      });

      const companyIds = companies.map((company) => company.id);

      const reviews = await ctx.db.query.Review.findMany({
        where: inArray(Review.companyId, companyIds),
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

      const minPay =
        totalReviews !== 0
          ? Math.min(...reviews.map((review) => Number(review.hourlyPay)))
          : 0;
      const maxPay =
        totalReviews !== 0
          ? Math.max(...reviews.map((review) => Number(review.hourlyPay)))
          : 0;

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
