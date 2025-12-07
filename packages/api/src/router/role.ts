import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Filter } from "bad-words";
import { z } from "zod";

import type { ReviewType, RoleType } from "@cooper/db/schema";
import { asc, desc, eq, sql } from "@cooper/db";
import { CreateRoleSchema, Review, Role } from "@cooper/db/schema";

import {
  protectedProcedure,
  publicProcedure,
  sortableProcedure,
} from "../trpc";
import { performFuseSearch } from "../utils/fuzzyHelper";

const ordering = {
  default: desc(Role.id),
  newest: desc(Role.createdAt),
  oldest: asc(Role.createdAt),
};

export const roleRouter = {
  list: sortableProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      let roles: RoleType[] = [];
      if (ctx.sortBy === "rating") {
        const rolesWithRatings = await ctx.db.execute(sql`
        SELECT 
          ${Role}.*, 
          COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
        FROM ${Role}
        LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
        GROUP BY ${Role.id}
        ORDER BY avg_rating DESC
      `);

        roles = rolesWithRatings.rows.map((role) => ({
          ...(role as RoleType),
        }));
      } else {
        roles = await ctx.db.query.Role.findMany({
          orderBy: ordering[ctx.sortBy],
        });
      }

      // Extract unique company IDs
      const companyIds = [...new Set(roles.map((role) => role.companyId))];

      // Fetch companies that match the extracted company IDs
      const companies = await ctx.db.query.Company.findMany({
        where: (company, { inArray }) => inArray(company.id, companyIds),
      });

      const rolesWithCompanies = roles.map((role) => {
        const company = companies.find((c) => c.id === role.companyId);
        return {
          ...role,
          companyName: company?.name ?? "",
        };
      });

      const fuseOptions = ["title", "description", "companyName"];

      const searchedRoles = performFuseSearch<
        RoleType & { companyName: string }
      >(rolesWithCompanies, fuseOptions, input.search);

      // Apply pagination
      const paginatedRoles = searchedRoles.slice(
        input.offset,
        input.offset + input.limit,
      );

      return {
        roles: paginatedRoles.map((role) => ({
          ...(role as RoleType),
        })),
        totalCount: searchedRoles.length,
      };
    }),

  getByTitle: sortableProcedure
    .input(z.object({ title: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.sortBy === "rating") {
        const rolesWithRatings = await ctx.db.execute(sql`
          SELECT
            ${Role}.*,
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Role}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Role.title} = ${input.title}
          GROUP BY ${Role.id}
          ORDER BY avg_rating DESC
        `);
        return rolesWithRatings.rows.map((role) => ({
          ...(role as RoleType),
        }));
      }
      return ctx.db.query.Role.findMany({
        where: eq(Role.title, input.title),
        orderBy: ordering[ctx.sortBy],
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findFirst({
        where: eq(Role.id, input.id),
      });
    }),

  getManyByIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findMany({
        where: (role, { inArray }) => inArray(role.id, input.ids),
      });
    }),

  getByCompany: sortableProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.sortBy === "rating") {
        const rolesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Role}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Role}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Role.companyId} = ${input.companyId}
          GROUP BY ${Role.id}
          ORDER BY avg_rating DESC
        `);

        return rolesWithRatings.rows.map((role) => ({
          ...(role as RoleType),
        }));
      }
      return ctx.db.query.Role.findMany({
        where: eq(Role.companyId, input.companyId),
        orderBy: ordering[ctx.sortBy],
      });
    }),

  create: protectedProcedure
    .input(CreateRoleSchema)
    .mutation(({ ctx, input }) => {
      const filter = new Filter();

      if (filter.isProfane(input.title)) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Title cannot contain profane words",
        });
      } else if (filter.isProfane(input.description ?? "")) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Description cannot contain profane words",
        });
      }

      const cleanInput = {
        ...input,
        title: filter.clean(input.title),
        description: filter.clean(input.description ?? ""),
      };
      return ctx.db.insert(Role).values(cleanInput).returning();
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Role).where(eq(Role.id, input));
  }),

  getByCreatedBy: sortableProcedure
    .input(z.object({ createdBy: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.Role.findMany({
        where: eq(Role.createdBy, input.createdBy),
      });
    }),

  getAverageById: sortableProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ ctx, input }) => {
      let reviews = await ctx.db.query.Review.findMany({
        where: eq(Review.roleId, input.roleId),
        orderBy: ordering.default,
      });
      if (ctx.sortBy === "rating") {
        const rolesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Role}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Role}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Role.id} = ${input.roleId}
          GROUP BY ${Role.id}
          ORDER BY avg_rating DESC
        `);

        reviews = rolesWithRatings.rows.map((role) => ({
          ...(role as ReviewType),
        }));
      } else {
        reviews = await ctx.db.query.Review.findMany({
          where: eq(Review.roleId, input.roleId),
          orderBy: ordering[ctx.sortBy],
        });
      }

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
      const travelBenefits = calcPercentage("travelBenefits");
      const snackBar = calcPercentage("snackBar");
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
        travelBenefits: travelBenefits,
        snackBar: snackBar,
        overtimeNormal: overtimeNormal,
        pto: pto,
        minPay: minPay,
        maxPay: maxPay,
      };
    }),
} satisfies TRPCRouterRecord;
