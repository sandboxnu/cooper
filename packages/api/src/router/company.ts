import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { CompanyType, ReviewType } from "@cooper/db/schema";
import { and, desc, eq, SQLWrapper } from "@cooper/db";
import {
  CompaniesToLocations,
  Company,
  CreateCompanySchema,
  Industry,
  Location,
  Review,
} from "@cooper/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";
import { performFuseSearch } from "../utils/fuzzyHelper";

export const companyRouter = {
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        options: z
        .object({
          industry: z.enum(Object.values(Industry) as [string, ...string[]]).optional(),
          location: z.string().optional(),
        })
        .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { options } = input;
      
      const conditions = [
        options?.industry && eq(Company.industry, options.industry),
        options?.location && eq(CompaniesToLocations.locationId, options.location),
      ].filter(Boolean) as SQLWrapper[];

      const companies = await ctx.db.query.Company.findMany({
        orderBy: desc(Company.id),
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });

      const fuseOptions = ["name", "industry", "description"];
      return performFuseSearch<CompanyType>(
        companies,
        fuseOptions,
        input.search,
      );
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

  getLocationsById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db
        .select()
        .from(CompaniesToLocations)
        .innerJoin(Location, eq(CompaniesToLocations.locationId, Location.id))
        .where(eq(CompaniesToLocations.companyId, input.id));
    }),

  create: protectedProcedure
    .input(CreateCompanySchema)
    .mutation(({ ctx, input }) => {
      if (input.website) {
        return ctx.db.insert(Company).values(input);
      }
      return ctx.db
        .insert(Company)
        .values({ ...input, website: `${input.name}.com` });
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Company).where(eq(Company.id, input));
  }),

  getAverageById: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.query.Review.findMany({
        where: eq(Review.companyId, input.companyId),
      });

      const calcAvg = (field: keyof ReviewType) => {
        return totalReviews > 0
          ? reviews.reduce((sum, review) => sum + Number(review[field]), 0) /
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

      return {
        averageOverallRating: averageOverallRating,
        averageHourlyPay: averageHourlyPay,
        averageInterviewDifficulty: averageInterviewDifficulty,
        averageCultureRating: averageCultureRating,
        averageSupervisorRating: averageSupervisorRating,
        averageInterviewRating: averageInterviewRating,
      };
    }),
} satisfies TRPCRouterRecord;
