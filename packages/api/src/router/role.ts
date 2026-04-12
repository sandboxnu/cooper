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

function calcDominantDifficulty(
  rounds: { interviewDifficulty: string | null }[],
): "easy" | "average" | "hard" | null {
  const counts = { easy: 0, average: 0, hard: 0 };
  for (const r of rounds) {
    if (r.interviewDifficulty) {
      counts[r.interviewDifficulty as keyof typeof counts]++;
    }
  }
  const total = counts.easy + counts.average + counts.hard;
  if (total === 0) return null;
  const maxCount = Math.max(counts.easy, counts.average, counts.hard);
  const tied = (["easy", "average", "hard"] as const).filter(
    (d) => counts[d] === maxCount,
  );
  if (tied.length === 1) return tied[0] ?? "average";
  const numericMap = { easy: 0, average: 1, hard: 2 };
  const avg = tied.reduce((sum, d) => sum + numericMap[d], 0) / tied.length;
  return (["easy", "average", "hard"] as const)[Math.floor(avg)] ?? "average";
}

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

  getInterviewDataById: sortableProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.query.Review.findMany({
        where: and(
          eq(Review.roleId, input.roleId),
          eq(Review.status, Status.PUBLISHED),
          eq(Review.hidden, false),
        ),
        with: { interviewRounds: true },
      });

      const reviewsWithRounds = reviews.filter(
        (r) => r.interviewRounds.length > 0,
      );
      const totalReviewsWithRounds = reviewsWithRounds.length;

      const roundsCounts = reviewsWithRounds.map(
        (r) => r.interviewRounds.length,
      );
      const distMap: Record<number, number> = {};
      for (const c of roundsCounts) distMap[c] = (distMap[c] ?? 0) + 1;
      const roundsDistribution = Object.entries(distMap)
        .map(([rounds, count]) => ({ rounds: Number(rounds), count }))
        .sort((a, b) => a.rounds - b.rounds);
      const sortedDistEntries = Object.entries(distMap).sort(
        (a, b) => b[1] - a[1],
      );
      const roundsMode =
        sortedDistEntries.length > 0 ? Number(sortedDistEntries[0]?.[0]) : null;

      const allRounds = reviewsWithRounds.flatMap((r) => r.interviewRounds);

      const typeMap: Record<
        string,
        { reviewIds: Set<string>; rounds: typeof allRounds }
      > = {};
      for (const review of reviewsWithRounds) {
        for (const round of review.interviewRounds) {
          if (!round.interviewType) continue;
          typeMap[round.interviewType] ??= {
            reviewIds: new Set(),
            rounds: [],
          };
          const entry = typeMap[round.interviewType];
          if (entry) {
            entry.reviewIds.add(review.id);
            entry.rounds.push(round);
          }
        }
      }
      const types = Object.entries(typeMap)
        .map(([type, { reviewIds, rounds }]) => ({
          type,
          reviewCount: reviewIds.size,
          dominantDifficulty: calcDominantDifficulty(rounds),
        }))
        .sort((a, b) => b.reviewCount - a.reviewCount);

      const overallDominantDifficulty = calcDominantDifficulty(allRounds);
      const companyId = reviews[0]?.companyId;
      const company = companyId
        ? await ctx.db.query.Company.findFirst({
            where: eq(Company.id, companyId),
          })
        : null;
      const industryName = company?.industry ?? null;

      return {
        totalReviewsWithRounds,
        roundsMode,
        roundsDistribution,
        types,
        overallDominantDifficulty,
        industryName,
      };
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
      const reviews = await ctx.db.query.Review.findMany({
        where: and(
          eq(Review.hidden, false),
          eq(Review.roleId, input.roleId),
          eq(Review.status, Status.PUBLISHED),
        ),
        with: {
          reviewsToTools: { with: { tool: true } },
        },
      });

      const totalReviews = reviews.length;

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

      // Work environment mode + tie handling + tooltip alerts
      const workEnvCounts = reviews.reduce<Record<string, number>>((acc, r) => {
        if (r.workEnvironment)
          acc[r.workEnvironment] = (acc[r.workEnvironment] ?? 0) + 1;
        return acc;
      }, {});
      const sortedEnvs = Object.entries(workEnvCounts).sort(
        ([, a], [, b]) => b - a,
      );
      const ENV_LABEL: Record<string, string> = {
        REMOTE: "Remote",
        HYBRID: "Hybrid",
        INPERSON: "In-Person",
      };
      const NUM_WORDS: Record<number, string> = {
        1: "One",
        2: "Two",
        3: "Three",
        4: "Four",
        5: "Five",
      };

      let workEnvironmentMode: string | null = null;
      if (sortedEnvs.length > 0) {
        const topCount = sortedEnvs[0]?.[1] ?? 0;
        const tied = sortedEnvs.filter(([, c]) => c === topCount);
        if (tied.length === 1) {
          const env0 = tied[0]?.[0] ?? "";
          workEnvironmentMode = ENV_LABEL[env0] ?? env0;
        } else if (tied.length === 2) {
          const env0 = tied[0]?.[0] ?? "";
          const env1 = tied[1]?.[0] ?? "";
          workEnvironmentMode = `${ENV_LABEL[env0] ?? env0} and ${ENV_LABEL[env1] ?? env1}`;
        } else {
          workEnvironmentMode = tied
            .map(([env]) => ENV_LABEL[env] ?? env)
            .join(", ")
            .replace(/, ([^,]*)$/, ", and $1");
        }
      }

      const topEnvCount = sortedEnvs[0]?.[1] ?? 0;
      const tiedEnvKeys = new Set(
        sortedEnvs.filter(([, c]) => c === topEnvCount).map(([e]) => e),
      );
      const workEnvironmentAlerts = sortedEnvs
        .filter(([env]) => !tiedEnvKeys.has(env))
        .map(
          ([env, count]) =>
            `${NUM_WORDS[count] ?? count} reported ${ENV_LABEL[env] ?? env}`,
        );

      // Job length range
      const jobLengths = reviews
        .map((r) => r.jobLength)
        .filter((v): v is number => v != null);
      const jobLengthMin =
        jobLengths.length > 0 ? Math.min(...jobLengths) : null;
      const jobLengthMax =
        jobLengths.length > 0 ? Math.max(...jobLengths) : null;

      // Work hours mode
      const workHoursCounts = reviews.reduce<Record<string, number>>(
        (acc, r) => {
          if (r.workHours != null)
            acc[String(r.workHours)] = (acc[String(r.workHours)] ?? 0) + 1;
          return acc;
        },
        {},
      );
      const workHoursSorted = Object.entries(workHoursCounts).sort(
        ([, a], [, b]) => b - a,
      );
      const workHoursMode =
        workHoursSorted[0]?.[0] != null ? Number(workHoursSorted[0][0]) : null;

      const overtimeCount = reviews.filter(
        (r) => r.overtimeNormal === true,
      ).length;
      const accessibleByTransportation = calcPercentage(
        "accessibleByTransportation",
      );
      const teamOutingsCount = reviews.filter(
        (r) => r.teamOutings === true,
      ).length;
      const coffeeChatCount = reviews.filter(
        (r) => r.coffeeChats === true,
      ).length;
      const constructiveFeedbackCount = reviews.filter(
        (r) => r.constructiveFeedback === true,
      ).length;
      const onboarding = calcPercentage("onboarding");
      const workStructure = calcPercentage("workStructure");
      const careerGrowth = calcPercentage("careerGrowth");

      const tools = [
        ...new Set(
          reviews.flatMap((r) => r.reviewsToTools.map((rt) => rt.tool.name)),
        ),
      ];

      return {
        averageOverallRating,
        averageHourlyPay,
        averageCultureRating,
        averageSupervisorRating,
        federalHolidays,
        drugTest,
        freeLunch,
        freeMerch,
        travelBenefits,
        snackBar,
        overtimeNormal,
        pto,
        minPay,
        maxPay,
        totalReviews,
        workEnvironmentMode,
        workEnvironmentAlerts,
        jobLengthMin,
        jobLengthMax,
        workHoursMode,
        overtimeCount,
        accessibleByTransportation,
        teamOutingsCount,
        coffeeChatCount,
        constructiveFeedbackCount,
        onboarding,
        workStructure,
        careerGrowth,
        tools,
      };
    }),
} satisfies TRPCRouterRecord;
