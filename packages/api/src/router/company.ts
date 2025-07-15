import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Filter } from "bad-words";
import { z } from "zod";

import type { SQL, SQLWrapper } from "@cooper/db";
import type { CompanyType, ReviewType } from "@cooper/db/schema";
import { and, asc, desc, eq, like, sql } from "@cooper/db";
import {
  CompaniesToLocations,
  Company,
  CreateCompanySchema,
  Industry,
  Location,
  Review,
  Role,
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
        prefix: z.string().optional(),
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

        const nameFilter = sql`${Company.name} ILIKE ${input.prefix ?? ""} || '%'`;

        const whereClause =
          filters.length > 0
            ? sql`WHERE ${sql.join(filters, sql` AND `)} AND ${nameFilter}`
            : sql`WHERE ${nameFilter}`;

        const companiesWithRatings = await ctx.db.execute(sql`
        SELECT 
          ${Company}.*, 
          COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
        FROM ${Company}
        LEFT JOIN ${Review} ON ${Review.companyId}::uuid = ${Company.id}
        ${whereClause}
        GROUP BY ${Company.id}
        ORDER BY avg_rating DESC
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
        like(Company.name, `${input.prefix}%`),
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

  createWithRole: protectedProcedure
    .input(
      z.object({
        companyName: z
          .string({ required_error: "Company name is required" })
          .min(3)
          .max(50),
        description: z
          .string({ required_error: "Description is required" })
          .min(10)
          .max(500),
        industry: z.string({ required_error: "Industry is required" }),
        website: z
          .string({ required_error: "Website is required" })
          .url()
          .optional(),
        roleTitle: z
          .string({ required_error: "Role title is required" })
          .min(3)
          .max(50),
        roleDescription: z
          .string({ required_error: "Role description is required" })
          .min(10)
          .max(500),
        createdBy: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const filter = new Filter();

      if (filter.isProfane(input.companyName)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Company name cannot contain profane words",
        });
      }

      if (filter.isProfane(input.description)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Description cannot contain profane words",
        });
      }

      if (filter.isProfane(input.roleTitle)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Role title cannot contain profane words",
        });
      }

      if (filter.isProfane(input.roleDescription)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Role description cannot contain profane words",
        });
      }

      const companyValues = {
        name: input.companyName,
        description: input.description,
        industry: input.industry,
        website: input.website ?? `${input.companyName}.com`,
      };

      const companies = await ctx.db
        .insert(Company)
        .values(companyValues)
        .returning();
      const companyId = companies[0]?.id;

      if (!companyId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Review headline cannot contain profane words",
        });
      }

      const roleValues = {
        title: input.roleTitle,
        description: input.roleDescription,
        companyId: companyId,
        createdBy: input.createdBy,
      };

      const roles = await ctx.db.insert(Role).values(roleValues).returning();
      const roleId = roles[0]?.id;

      if (!roleId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Role creation failed",
        });
      }

      return roleId;
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
