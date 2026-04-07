import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Filter } from "bad-words";
import Fuse from "fuse.js";
import { z } from "zod";

import type { ReviewType } from "@cooper/db/schema";
import { and, desc, eq, inArray, isNull } from "@cooper/db";
import {
  CompaniesToLocations,
  Company,
  CreateInterviewRoundSchema,
  CreateReviewSchema,
  InterviewRound,
  Review,
  Status,
} from "@cooper/db/schema";

const CreateReviewWithRoundsSchema = CreateReviewSchema.extend({
  interviewRounds: z
    .array(CreateInterviewRoundSchema.omit({ reviewId: true }))
    .optional()
    .default([]),
});
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
        eq(Review.status, Status.PUBLISHED),
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
        where: and(
          eq(Review.roleId, input.id),
          eq(Review.status, Status.PUBLISHED),
        ),
      });
    }),

  getByCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: and(
          eq(Review.companyId, input.id),
          eq(Review.status, Status.PUBLISHED),
        ),
      });
    }),

  getByProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Review.findMany({
        where: and(eq(Review.hidden, false), eq(Review.profileId, input.id)),
      });
    }),

  create: protectedProcedure
    .input(CreateReviewWithRoundsSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewRounds, ...reviewInput } = input;

      if (!reviewInput.profileId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be logged in to leave a review",
        });
      }

      // Initialize bad words filter
      const filter = new Filter();

      if (filter.isProfane(reviewInput.textReview ?? "")) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Review text cannot contain profane words",
        });
      }

      // Create a clean version of the input with filtered strings
      const cleanInput = {
        ...reviewInput,
        textReview: filter.clean(reviewInput.textReview ?? ""),
        profileId: reviewInput.profileId,
      };

      // Rest of the validation logic
      const reviews = await ctx.db.query.Review.findMany({
        where: eq(Review.profileId, cleanInput.profileId),
      });
      const publishedReviews = reviews.filter(
        (review) => review.status === Status.PUBLISHED,
      );
      if (publishedReviews.length >= 5) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You can only leave 5 reviews",
        });
      }
      const reviewsInSameCycle = reviews.filter(
        (review) =>
          review.workTerm === cleanInput.workTerm &&
          review.workYear === cleanInput.workYear,
      );
      if (reviewsInSameCycle.length >= 2) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You can only leave 2 reviews per cycle",
        });
      }

      // Check if a CompaniesToLocations object already exists with the given companyId and locationId
      if (input.locationId && input.companyId) {
        const existingRelation =
          await ctx.db.query.CompaniesToLocations.findFirst({
            where: and(
              eq(CompaniesToLocations.companyId, input.companyId ?? ""),
              eq(CompaniesToLocations.locationId, input.locationId ?? ""),
            ),
          });

        if (!existingRelation) {
          await ctx.db.insert(CompaniesToLocations).values({
            locationId: input.locationId ?? "",
            companyId: input.companyId ?? "",
          });
        }
      }

      const [inserted] = await ctx.db
        .insert(Review)
        .values(cleanInput)
        .returning({ id: Review.id });

      const completeRounds = (interviewRounds ?? []).filter(
        (r) => r.interviewType != null && r.interviewDifficulty != null,
      );
      if (completeRounds.length && inserted) {
        await ctx.db.insert(InterviewRound).values(
          completeRounds.map((r) => ({
            interviewType: r.interviewType!,
            interviewDifficulty: r.interviewDifficulty!,
            reviewId: inserted.id,
          })),
        );
      }
    }),

  saveDraft: protectedProcedure
    .input(CreateReviewWithRoundsSchema)
    .mutation(async ({ ctx, input }) => {
      const { interviewRounds, ...reviewInput } = input;

      if (!reviewInput.profileId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be logged in to save a draft",
        });
      }

      const draftInput = {
        ...reviewInput,
        status: Status.DRAFT,
      };

      const existingReview = await ctx.db.query.Review.findFirst({
        where: and(
          reviewInput.companyId == null
            ? isNull(Review.companyId)
            : eq(Review.companyId, reviewInput.companyId),
          reviewInput.locationId == null
            ? isNull(Review.locationId)
            : eq(Review.locationId, reviewInput.locationId),
          eq(Review.profileId, reviewInput.profileId),
          reviewInput.workTerm == null
            ? isNull(Review.workTerm)
            : eq(Review.workTerm, reviewInput.workTerm),
          reviewInput.workYear == null
            ? isNull(Review.workYear)
            : eq(Review.workYear, reviewInput.workYear),
          eq(Review.status, Status.DRAFT),
          reviewInput.roleId == null
            ? isNull(Review.roleId)
            : eq(Review.roleId, reviewInput.roleId),
          reviewInput.overallRating == null
            ? isNull(Review.overallRating)
            : eq(Review.overallRating, reviewInput.overallRating),
          reviewInput.hourlyPay == null
            ? isNull(Review.hourlyPay)
            : eq(Review.hourlyPay, reviewInput.hourlyPay),
          reviewInput.cultureRating == null
            ? isNull(Review.cultureRating)
            : eq(Review.cultureRating, reviewInput.cultureRating),
          reviewInput.supervisorRating == null
            ? isNull(Review.supervisorRating)
            : eq(Review.supervisorRating, reviewInput.supervisorRating),
          reviewInput.federalHolidays == null
            ? isNull(Review.federalHolidays)
            : eq(Review.federalHolidays, reviewInput.federalHolidays),
          reviewInput.drugTest == null
            ? isNull(Review.drugTest)
            : eq(Review.drugTest, reviewInput.drugTest),
          reviewInput.freeLunch == null
            ? isNull(Review.freeLunch)
            : eq(Review.freeLunch, reviewInput.freeLunch),
          reviewInput.freeMerch == null
            ? isNull(Review.freeMerch)
            : eq(Review.freeMerch, reviewInput.freeMerch),
          reviewInput.travelBenefits == null
            ? isNull(Review.travelBenefits)
            : eq(Review.travelBenefits, reviewInput.travelBenefits),
          reviewInput.overtimeNormal == null
            ? isNull(Review.overtimeNormal)
            : eq(Review.overtimeNormal, reviewInput.overtimeNormal),
          reviewInput.pto == null
            ? isNull(Review.pto)
            : eq(Review.pto, reviewInput.pto),
          reviewInput.textReview == null
            ? isNull(Review.textReview)
            : eq(Review.textReview, reviewInput.textReview),
        ),
      });

      if (existingReview) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This draft is a duplicate of an existing draft.",
        });
      }

      const [inserted] = await ctx.db
        .insert(Review)
        .values(draftInput)
        .returning({ id: Review.id });

      const completeRounds = (interviewRounds ?? []).filter(
        (r) => r.interviewType != null && r.interviewDifficulty != null,
      );
      if (completeRounds.length && inserted) {
        await ctx.db.insert(InterviewRound).values(
          completeRounds.map((r) => ({
            interviewType: r.interviewType!,
            interviewDifficulty: r.interviewDifficulty!,
            reviewId: inserted.id,
          })),
        );
      }
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
        where: and(
          inArray(Review.companyId, companyIds),
          eq(Review.status, Status.PUBLISHED),
        ),
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
      const averageCultureRating = calcAvg("cultureRating");
      const averageSupervisorRating = calcAvg("supervisorRating");

      const federalHolidays = calcPercentage("federalHolidays");
      const drugTest = calcPercentage("drugTest");
      const freeLunch = calcPercentage("freeLunch");
      const freeMerch = calcPercentage("freeMerch");
      const travelBenefits = calcPercentage("travelBenefits");
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
        averageCultureRating: averageCultureRating,
        averageSupervisorRating: averageSupervisorRating,
        federalHolidays: federalHolidays,
        drugTest: drugTest,
        freeLunch: freeLunch,
        freeMerch: freeMerch,
        travelBenefits: travelBenefits,
        overtimeNormal: overtimeNormal,
        pto: pto,
        minPay: minPay,
        maxPay: maxPay,
      };
    }),
} satisfies TRPCRouterRecord;
