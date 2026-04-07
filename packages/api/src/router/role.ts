import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Filter } from "bad-words";
import { z } from "zod";

import type { ReviewType, RoleType } from "@cooper/db/schema";
import { and, asc, desc, eq, sql } from "@cooper/db";
import {
  Company,
  CreateRoleSchema,
  Review,
  Role,
  Status,
} from "@cooper/db/schema";

import {
  protectedProcedure,
  publicProcedure,
  sortableProcedure,
} from "../trpc";
import { createSlug, generateUniqueSlug } from "../utils/slugHelpers";
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
        INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
        GROUP BY ${Role.id}
        ORDER BY avg_rating DESC
      `);

        roles = rolesWithRatings.rows.map((role) => ({
          ...(role as RoleType),
        }));
      } else {
        const rolesWithReviews = await ctx.db.execute(sql`
        SELECT DISTINCT ${Review.roleId}::uuid as role_id
        FROM ${Review}
        WHERE ${Review.roleId} != '' AND ${Review.roleId} IS NOT NULL
      `);
        const roleIds = rolesWithReviews.rows.map((row) => String(row.role_id));

        if (roleIds.length === 0) {
          roles = [];
        } else {
          roles = await ctx.db.query.Role.findMany({
            where: (role, { inArray }) => inArray(role.id, roleIds),
            orderBy: ordering[ctx.sortBy],
          });
        }
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
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findFirst({
        where: eq(Role.id, input.id),
      });
    }),

  getByIdWithCompany: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.query.Role.findFirst({
        where: eq(Role.id, input.id),
      });

      if (!role) return null;

      const company = await ctx.db.query.Company.findFirst({
        where: eq(Company.id, role.companyId),
        columns: { name: true, slug: true },
      });

      return {
        ...role,
        type: "role" as const,
        companyName: company?.name,
        companySlug: company?.slug,
      } as RoleType & {
        type: "role";
        companyName?: string;
        companySlug?: string;
      };
    }),

  getByCompanySlugAndRoleSlug: publicProcedure
    .input(z.object({ companySlug: z.string(), roleSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.query.Company.findFirst({
        where: eq(Company.slug, input.companySlug),
      });

      if (!company) return null;

      const role = await ctx.db.query.Role.findFirst({
        where: and(
          eq(Role.companyId, company.id),
          eq(Role.slug, input.roleSlug),
        ),
      });

      if (!role) return null;

      // Return role with company name and slug included
      return {
        ...role,
        companyName: company.name,
        companySlug: company.slug,
      };
    }),

  getManyByIds: publicProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findMany({
        where: (role, { and, eq, inArray }) =>
          and(eq(role.hidden, false), inArray(role.id, input.ids)),
      });
    }),

  getByCompany: sortableProcedure
    .input(
      z.object({
        companyId: z.string(),
        onlyWithReviews: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.onlyWithReviews) {
        // Get roles that have reviews
        const rolesWithReviews = await ctx.db.execute(sql`
          SELECT DISTINCT ${Review.roleId}::uuid as role_id
          FROM ${Review}
          WHERE ${Review.roleId} != ''
            AND ${Review.roleId} IS NOT NULL
            AND ${Review.status} = ${Status.PUBLISHED}
            AND ${Review.hidden} = false 
        `);

        const roleIds = rolesWithReviews.rows.map((row) => String(row.role_id));

        if (roleIds.length === 0) {
          return [];
        }

        return ctx.db.query.Role.findMany({
          where: (role, { eq, and, inArray }) =>
            and(
              eq(role.hidden, false),
              eq(role.companyId, input.companyId),
              inArray(role.id, roleIds),
            ),
        });
      }

      return ctx.db.query.Role.findMany({
        where: and(eq(Role.hidden, false), eq(Role.companyId, input.companyId)),
      });
    }),

  create: protectedProcedure
    .input(CreateRoleSchema)
    .mutation(async ({ ctx, input }) => {
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

      // Generate unique slug for role (only unique within the same company)
      const baseSlug = createSlug(cleanInput.title);
      const existingRoles = await ctx.db.query.Role.findMany({
        where: (role, { eq }) => eq(role.companyId, cleanInput.companyId),
        columns: { slug: true },
      });
      const existingSlugs = existingRoles.map((r) => r.slug);
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

      return ctx.db
        .insert(Role)
        .values({ ...cleanInput, slug: uniqueSlug })
        .returning();
    }),

  getByCreatedBy: sortableProcedure
    .input(z.object({ createdBy: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.Role.findMany({
        where: and(eq(Role.hidden, false), eq(Role.createdBy, input.createdBy)),
      });
    }),

  getAverageById: sortableProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ ctx, input }) => {
      let reviews = await ctx.db.query.Review.findMany({
        where: and(
          eq(Review.hidden, false),
          eq(Review.roleId, input.roleId),
          eq(Review.status, Status.PUBLISHED),
        ),
        orderBy: ordering.default,
      });
      reviews = await ctx.db.query.Review.findMany({
        where: and(
          eq(Review.hidden, false),
          eq(Review.roleId, input.roleId),
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
        averageCultureRating: averageCultureRating,
        averageSupervisorRating: averageSupervisorRating,
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
