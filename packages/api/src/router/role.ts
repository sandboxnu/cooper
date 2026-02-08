import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Filter } from "bad-words";
import { z } from "zod";

import type { ReviewType } from "@cooper/db/schema";
import { and, asc, desc, eq, sql } from "@cooper/db";
import { Company, CreateRoleSchema, Review, Role } from "@cooper/db/schema";

import {
  protectedProcedure,
  publicProcedure,
  sortableProcedure,
} from "../trpc";
import { createSlug, generateUniqueSlug } from "../utils/slugHelpers";

const ordering = {
  default: desc(Role.id),
  newest: desc(Role.createdAt),
  oldest: asc(Role.createdAt),
};

export const roleRouter = {
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Role.findFirst({
        where: eq(Role.id, input.id),
      });
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
        where: (role, { inArray }) => inArray(role.id, input.ids),
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
          WHERE ${Review.roleId} != '' AND ${Review.roleId} IS NOT NULL
        `);

        const roleIds = rolesWithReviews.rows.map((row) => String(row.role_id));

        if (roleIds.length === 0) {
          return [];
        }

        return ctx.db.query.Role.findMany({
          where: (role, { eq, and, inArray }) =>
            and(eq(role.companyId, input.companyId), inArray(role.id, roleIds)),
        });
      }

      return ctx.db.query.Role.findMany({
        where: eq(Role.companyId, input.companyId),
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
      reviews = await ctx.db.query.Review.findMany({
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
