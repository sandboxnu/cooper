import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { CompanyType, ReviewType } from "@cooper/db/schema";
import { SQL, SQLWrapper, and, asc, desc, eq, sql } from "@cooper/db";
import {
  CompaniesToLocations,
  Company,
  CreateCompanySchema,
  Location,
  Industry,
  Review,
} from "@cooper/db/schema";

import {
  protectedProcedure,
  publicProcedure,
  sortableProcedure,
} from "../trpc";
import { performFuseSearch } from "../utils/fuzzyHelper";

const ordering = {
  default: desc(Company.id),
  newest: desc(Company.createdAt),
  oldest: asc(Company.createdAt),
};

export const companyRouter = {
  list: sortableProcedure
    .input(
      z.object({
        search: z.string().optional(),
        options: z
          .object({
            industry: z
              .enum(Object.values(Industry) as [string, ...string[]])
              .optional(),
            location: z.string().optional(),
          })
          .optional(),
        limit: z.number().optional().default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.sortBy === "rating" || ctx.sortBy === "default") {
        const filters: SQL[] = [];

        if (input.options?.industry) {
          filters.push(sql`${Company.industry} = ${input.options.industry}`);
        }

        if (input.options?.location) {
          filters.push(sql`${Company.id} IN (
            SELECT ${CompaniesToLocations.companyId}
            FROM ${CompaniesToLocations}
            WHERE ${CompaniesToLocations.locationId} = ${input.options.location}
          )`);
        }

        const whereClause =
          filters.length > 0
            ? sql`WHERE ${sql.join(filters, sql` AND `)}`
            : sql``;

        const companiesWithRatings = await ctx.db.execute(sql`
        SELECT 
          ${Company}.*, 
          COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
        FROM ${Company}
        LEFT JOIN ${Review} ON ${Review.companyId}::uuid = ${Company.id}
        ${whereClause}
        GROUP BY ${Company.id}
        ORDER BY avg_rating DESC
        LIMIT ${input.limit}
      `);

        const companies = companiesWithRatings.rows.map((role) => ({
          ...(role as CompanyType),
        }));

        const fuseOptions = ["name", "description"];
        return performFuseSearch<CompanyType>(
          companies,
          fuseOptions,
          input.search,
        ).slice(0, input.limit);
      }

      const conditions = [
        input.options?.industry && eq(Company.industry, input.options.industry),
        input.options?.location &&
          eq(CompaniesToLocations.locationId, input.options.location),
      ].filter(Boolean) as SQLWrapper[];

      const companies = await ctx.db.query.Company.findMany({
        orderBy: ordering[ctx.sortBy],
        where: conditions.length > 0 ? and(...conditions) : undefined,
      });

      const fuseOptions = ["name", "description"];
      return performFuseSearch<CompanyType>(
        companies,
        fuseOptions,
        input.search,
      ).slice(0, input.limit);
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
