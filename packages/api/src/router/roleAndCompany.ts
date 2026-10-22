import { z } from "zod";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { Status } from "@cooper/db/schema";
import { asc, desc, sql } from "@cooper/db";
import { Company, JobType, Review, Role } from "@cooper/db/schema";

import { publicProcedure, sortableProcedure } from "../trpc";

/** UI / legacy filter tokens → canonical `Review.jobType` values */
const JOB_TYPE_FILTER_ALIASES: Record<string, string> = {
  "CO-OP": JobType.COOP,
  COOP: JobType.COOP,
  INTERNSHIP: JobType.INTERNSHIP,
};
import { performFuseSearch } from "../utils/fuzzyHelper";

const ordering = {
  default: desc(Role.id),
  newest: desc(Role.createdAt),
  oldest: asc(Role.createdAt),
};

const companyOrdering = {
  default: desc(Company.id),
  newest: desc(Company.createdAt),
  oldest: asc(Company.createdAt),
};

// Review questions the on-the-job filters look at
const ON_THE_JOB_COLUMNS = {
  federalHolidays: Review.federalHolidays,
  accessibleByTransportation: Review.accessibleByTransportation,
  drugTest: Review.drugTest,
  freeLunch: Review.freeLunch,
  freeMerch: Review.freeMerch,
  snackBar: Review.snackBar,
  travelBenefits: Review.travelBenefits,
};
type OnTheJobShares = Record<keyof typeof ON_THE_JOB_COLUMNS, number>;

// Each filter option passes on the same threshold the On the Job section uses
// for its labels (federal holidays: at least half); a benefit passes if any
// review reports it
const ON_THE_JOB_RULES = {
  federalHolidays: (s: OnTheJobShares) => s.federalHolidays >= 0.5,
  accessibleByTransportation: (s: OnTheJobShares) =>
    s.accessibleByTransportation > 0.5,
  noDrugTest: (s: OnTheJobShares) => s.drugTest < 0.5,
  freeLunch: (s: OnTheJobShares) => s.freeLunch > 0,
  freeMerch: (s: OnTheJobShares) => s.freeMerch > 0,
  snackBar: (s: OnTheJobShares) => s.snackBar > 0,
  travelBenefits: (s: OnTheJobShares) => s.travelBenefits > 0,
};
type OnTheJobFilterId = keyof typeof ON_THE_JOB_RULES;

// One "share of yes answers" column per question, named after its key
const onTheJobShareColumns = sql.join(
  Object.entries(ON_THE_JOB_COLUMNS).map(
    ([key, column]) =>
      sql`COALESCE(AVG(CASE WHEN ${column} = true THEN 1.0 ELSE 0 END), 0) AS ${sql.raw(`"${key}"`)}`,
  ),
  sql`, `,
);

const toOnTheJobShares = (row: Record<string, unknown>) =>
  Object.fromEntries(
    Object.keys(ON_THE_JOB_COLUMNS).map((key) => [key, Number(row[key] ?? 0)]),
  ) as OnTheJobShares;

export const roleAndCompanyRouter = {
  list: sortableProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
        type: z.enum(["roles", "companies", "all"]).default("all"),
        filters: z
          .object({
            industries: z.array(z.string()).optional(),
            locations: z.array(z.string()).optional(),
            jobTypes: z.array(z.string()).optional(),
            minPay: z.number().optional(),
            maxPay: z.number().optional(),
            ratings: z.array(z.string()).optional(),
            workModels: z.array(z.string()).optional(),
            overtimeWork: z.boolean().optional(),
            // Average reported hours per week
            minHours: z.number().optional(),
            maxHours: z.number().optional(),
            // On the job option ids, e.g. "federalHolidays", "noDrugTest",
            // "freeLunch"; see ON_THE_JOB_RULES
            onTheJob: z.array(z.string()).optional(),
          })
          .optional(),
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
        INNER JOIN ${Company} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
        INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
        WHERE ${Review.status} = ${Status.PUBLISHED} 
          AND ${Company.hidden} = false 
          AND ${Role.hidden} = false 
          AND ${Review.hidden} = false
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
        INNER JOIN ${Role} ON ${Review.roleId}::uuid = ${Role.id}
        INNER JOIN ${Company} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
        WHERE ${Company.hidden} = false AND ${Role.hidden} = false AND ${Review.hidden} = false AND ${Review.roleId} != '' AND ${Review.roleId} IS NOT NULL
        AND ${Review.status} = ${Status.PUBLISHED}
      `);

        const roleIds = rolesWithReviews.rows.map((row) => String(row.role_id));

        if (roleIds.length === 0) {
          roles = [];
        } else {
          roles = await ctx.db.query.Role.findMany({
            where: (role, { and, eq, inArray }) =>
              and(eq(role.hidden, false), inArray(role.id, roleIds)),
            orderBy: ordering[ctx.sortBy],
          });
        }
      }

      let companies: CompanyType[] = [];
      if (ctx.sortBy === "rating") {
        const companiesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Company}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Review.status} = ${Status.PUBLISHED}
            AND ${Company.hidden} = false
            AND ${Review.hidden} = false
            AND ${Role.hidden} = false
          GROUP BY ${Company.id}
          ORDER BY avg_rating DESC
        `);

        companies = companiesWithRatings.rows.map((company) => ({
          ...(company as CompanyType),
        }));
      } else {
        const foundCompanies = await ctx.db.query.Company.findMany({
          orderBy: companyOrdering[ctx.sortBy],
          where: (company, { eq }) => eq(company.hidden, false),
        });

        const companiesWithReviews = await ctx.db.execute(sql`
          SELECT DISTINCT ${Company.id}::uuid as company_id
          FROM ${Company}
          INNER JOIN ${Role} ON ${Role.companyId}::uuid = ${Company.id}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Company.hidden} = false
            AND ${Role.hidden} = false
            AND ${Review.hidden} = false
            AND ${Review.roleId} != ''
            AND ${Review.roleId} IS NOT NULL
            AND ${Review.status} = ${Status.PUBLISHED}
        `);

        const companyIdsWithReviews = new Set(
          companiesWithReviews.rows.map((row) => String(row.company_id)),
        );

        companies = foundCompanies.filter((company) =>
          companyIdsWithReviews.has(company.id),
        );
      }

      const rolesWithCompanies = roles.map((role) => {
        const company = companies.find((c) => c.id === role.companyId);

        return {
          ...role,
          companyName: company?.name ?? "",
          // Real slug for URLs; names aren't unique (e.g. "google" and
          // "Google" are different companies, slugged google and google-2)
          companySlug: company?.slug,
          companyIndustry: company?.industry ?? "",
          type: "role" as const,
        };
      });

      const companiesWithType = companies.map((company) => ({
        ...company,
        type: "company" as const,
      }));

      const combinedItems = input.search
        ? [...companiesWithType, ...rolesWithCompanies]
        : [...rolesWithCompanies, ...companiesWithType];

      const filters = input.filters ?? {};

      const industryFilterActive =
        Array.isArray(filters.industries) && filters.industries.length > 0;
      const locationFilterActive =
        Array.isArray(filters.locations) && filters.locations.length > 0;
      const ratingsFilterActive =
        Array.isArray(filters.ratings) && filters.ratings.length > 0;
      const jobTypeFilterActive =
        Array.isArray(filters.jobTypes) && filters.jobTypes.length > 0;
      const overtimeWorkFilterActive = filters.overtimeWork === true;
      const workHoursFilterActive =
        typeof filters.minHours === "number" ||
        typeof filters.maxHours === "number";
      const onTheJobFilters = (filters.onTheJob ?? []).filter(
        (id): id is OnTheJobFilterId => id in ON_THE_JOB_RULES,
      );
      const workModelsFilterActive =
        Array.isArray(filters.workModels) && filters.workModels.length > 0;

      // Build company -> location mapping if location filter is active
      const companyLocationsMap = new Map<string, string[]>();
      if (locationFilterActive) {
        const locationIds = filters.locations;
        // Query the join table for matching company <-> location rows
        const companyLocRows =
          await ctx.db.query.CompaniesToLocations.findMany();

        for (const r of companyLocRows) {
          // r.companyId / r.locationId come from the CompaniesToLocations schema
          if (!locationIds?.includes(r.locationId)) continue;
          const cid = r.companyId;
          const lid = r.locationId;
          const arr = companyLocationsMap.get(cid) ?? [];
          arr.push(lid);
          companyLocationsMap.set(cid, arr);
        }
      }

      // Build company -> job types mapping if job type filter is active
      const companyJobTypesMap = new Map<string, string[]>();
      const roleJobTypesMap = new Map<string, string[]>();
      if (jobTypeFilterActive && roles.length > 0) {
        const roleIds = roles.map((r) => r.id);
        const reviewsWithJobType = await ctx.db.query.Review.findMany({
          where: (review, { inArray, and, eq }) =>
            and(
              inArray(review.roleId, roleIds),
              eq(review.status, Status.PUBLISHED),
            ),
          columns: { companyId: true, roleId: true, jobType: true },
        });
        for (const r of reviewsWithJobType) {
          if (!r.jobType) continue;
          const jt = String(r.jobType);
          if (r.companyId) {
            const cid = String(r.companyId);
            const cArr = companyJobTypesMap.get(cid) ?? [];
            if (!cArr.includes(jt)) cArr.push(jt);
            companyJobTypesMap.set(cid, cArr);
          }
          if (r.roleId) {
            const rid = String(r.roleId);
            const rArr = roleJobTypesMap.get(rid) ?? [];
            if (!rArr.includes(jt)) rArr.push(jt);
            roleJobTypesMap.set(rid, rArr);
          }
        }
      }

      // Build average hourly pay maps for roles and companies so we can filter by pay range
      const roleAvgPayMap = new Map<string, number>();
      const companyAvgPayMap = new Map<string, number>();
      const roleAvgRatingMap = new Map<string, number>();
      const companyAvgRatingMap = new Map<string, number>();
      // Share of published reviews answering yes, per on-the-job question
      const roleOnTheJobSharesMap = new Map<string, OnTheJobShares>();
      const companyOnTheJobSharesMap = new Map<string, OnTheJobShares>();
      // Only items with at least one review reporting hours get an entry
      const roleAvgHoursMap = new Map<string, number>();
      const companyAvgHoursMap = new Map<string, number>();
      const roleOvertimePercentMap = new Map<string, number>();
      const companyOvertimePercentMap = new Map<string, number>();
      const roleWorkModelsMap = new Map<string, string[]>();
      const companyWorkModelsMap = new Map<string, string[]>();

      // prepare id lists
      const roleIds = roles.map((r) => r.id);
      const companyIds = companies.map((c) => c.id);

      if (roleIds.length > 0) {
        const rolesWithAvgPay = await ctx.db.execute(sql`
          SELECT
            ${Role.id} AS id,
            COALESCE(AVG(${Review.hourlyPay}::float), 0) AS avg_hourly_pay
          FROM ${Role}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Role.id}
        `);

        for (const row of rolesWithAvgPay.rows) {
          roleAvgPayMap.set(String(row.id), Number(row.avg_hourly_pay ?? 0));
        }
        const rolesWithAvgRating = await ctx.db.execute(sql`
          SELECT
            ${Role.id} AS id,
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Role}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Role.id}
        `);

        for (const row of rolesWithAvgRating.rows) {
          roleAvgRatingMap.set(String(row.id), Number(row.avg_rating ?? 0));
        }

        if (workHoursFilterActive) {
          const rolesWithAvgHours = await ctx.db.execute(sql`
            SELECT
              ${Role.id} AS id,
              AVG(${Review.workHours}::float) AS avg_hours
            FROM ${Role}
            INNER JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
            WHERE ${Role.id} IN (${sql.join(
              roleIds.map((id) => sql`${id}`),
              sql`,`,
            )})
              AND ${Review.status} = ${Status.PUBLISHED}
              AND ${Review.workHours} IS NOT NULL
            GROUP BY ${Role.id}
          `);

          for (const row of rolesWithAvgHours.rows) {
            roleAvgHoursMap.set(String(row.id), Number(row.avg_hours));
          }
        }

        if (onTheJobFilters.length > 0) {
          const rolesWithOnTheJobShares = await ctx.db.execute(sql`
            SELECT
              ${Role.id} AS id,
              ${onTheJobShareColumns}
            FROM ${Role}
            LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
            WHERE ${Role.id} IN (${sql.join(
              roleIds.map((id) => sql`${id}`),
              sql`,`,
            )})
              AND ${Review.status} = ${Status.PUBLISHED}
            GROUP BY ${Role.id}
          `);

          for (const row of rolesWithOnTheJobShares.rows) {
            roleOnTheJobSharesMap.set(String(row.id), toOnTheJobShares(row));
          }
        }

        const rolesWithOvertimePercent = await ctx.db.execute(sql`
          SELECT
            ${Role.id} AS id,
            COALESCE(
              SUM(CASE WHEN ${Review.overtimeNormal} = true THEN 1 ELSE 0 END)::float / 
              NULLIF(COUNT(${Review.id})::float, 0),
              0
            ) AS overtime_percent
          FROM ${Role}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Role.id}
        `);

        for (const row of rolesWithOvertimePercent.rows) {
          roleOvertimePercentMap.set(
            String(row.id),
            Number(row.overtime_percent ?? 0),
          );
        }

        const rolesWithWorkModels = await ctx.db.execute(sql`
          SELECT
            ${Role.id} AS id,
            array_agg(DISTINCT ${Review.workEnvironment}) as work_models
          FROM ${Role}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Role.id}
        `);

        for (const row of rolesWithWorkModels.rows) {
          const models = (row.work_models as (string | null)[] | null) ?? [];
          roleWorkModelsMap.set(
            String(row.id),
            models.filter((m) => m !== null),
          );
        }
      }

      if (companyIds.length > 0) {
        const companiesWithAvgPay = await ctx.db.execute(sql`
          SELECT
            ${Company.id} AS id,
            COALESCE(AVG(${Review.hourlyPay}::float), 0) AS avg_hourly_pay
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Company.id}
        `);

        for (const row of companiesWithAvgPay.rows) {
          companyAvgPayMap.set(String(row.id), Number(row.avg_hourly_pay ?? 0));
        }
        const companiesWithAvgRating = await ctx.db.execute(sql`
          SELECT
            ${Company.id} AS id,
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Company.id}
        `);

        for (const row of companiesWithAvgRating.rows) {
          companyAvgRatingMap.set(String(row.id), Number(row.avg_rating ?? 0));
        }

        if (workHoursFilterActive) {
          const companiesWithAvgHours = await ctx.db.execute(sql`
            SELECT
              ${Company.id} AS id,
              AVG(${Review.workHours}::float) AS avg_hours
            FROM ${Company}
            INNER JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
            INNER JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
            WHERE ${Company.id} IN (${sql.join(
              companyIds.map((id) => sql`${id}`),
              sql`,`,
            )})
              AND ${Review.status} = ${Status.PUBLISHED}
              AND ${Review.workHours} IS NOT NULL
            GROUP BY ${Company.id}
          `);

          for (const row of companiesWithAvgHours.rows) {
            companyAvgHoursMap.set(String(row.id), Number(row.avg_hours));
          }
        }

        if (onTheJobFilters.length > 0) {
          const companiesWithOnTheJobShares = await ctx.db.execute(sql`
            SELECT
              ${Company.id} AS id,
              ${onTheJobShareColumns}
            FROM ${Company}
            LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
            LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
            WHERE ${Company.id} IN (${sql.join(
              companyIds.map((id) => sql`${id}`),
              sql`,`,
            )})
              AND ${Review.status} = ${Status.PUBLISHED}
            GROUP BY ${Company.id}
          `);

          for (const row of companiesWithOnTheJobShares.rows) {
            companyOnTheJobSharesMap.set(
              String(row.id),
              toOnTheJobShares(row),
            );
          }
        }

        const companiesWithOvertimePercent = await ctx.db.execute(sql`
          SELECT
            ${Company.id} AS id,
            COALESCE(
              SUM(CASE WHEN ${Review.overtimeNormal} = true THEN 1 ELSE 0 END)::float / 
              NULLIF(COUNT(${Review.id})::float, 0),
              0
            ) AS overtime_percent
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Company.id}
        `);

        for (const row of companiesWithOvertimePercent.rows) {
          companyOvertimePercentMap.set(
            String(row.id),
            Number(row.overtime_percent ?? 0),
          );
        }

        const companiesWithWorkModels = await ctx.db.execute(sql`
          SELECT
            ${Company.id} AS id,
            array_agg(DISTINCT ${Review.workEnvironment}) as work_models
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
            AND ${Review.status} = ${Status.PUBLISHED}
          GROUP BY ${Company.id}
        `);

        for (const row of companiesWithWorkModels.rows) {
          const models = (row.work_models as (string | null)[] | null) ?? [];
          companyWorkModelsMap.set(
            String(row.id),
            models.filter((m) => m !== null),
          );
        }
      }

      const allowedJobTypesCanonical = (filters.jobTypes ?? []).map(
        (t) => JOB_TYPE_FILTER_ALIASES[t] ?? t,
      );

      // Apply all filters EXCEPT the `type` selector to produce baseFilteredItems
      const baseFilteredItems = combinedItems.filter((item) => {
        const allowedIndustries = filters.industries ?? [];
        const allowedLocations = filters.locations ?? [];

        const industryOk = industryFilterActive
          ? item.type === "company"
            ? allowedIndustries.includes((item as CompanyType).industry)
            : allowedIndustries.includes(
                (item as RoleType & { companyIndustry?: string })
                  .companyIndustry ?? "",
              )
          : true;

        const locationOk = locationFilterActive
          ? (() => {
              // For companies, check company->location mapping
              if (item.type === "company") {
                const cid = (item as CompanyType).id;
                const mapped = companyLocationsMap.get(cid) ?? [];
                return mapped.some((lid) => allowedLocations.includes(lid));
              }
              // For roles, check the role's company mapping
              const roleCompanyId = (item as RoleType).companyId;
              const mapped = companyLocationsMap.get(roleCompanyId) ?? [];
              return mapped.some((lid) => allowedLocations.includes(lid));
            })()
          : true;

        const jobTypeOk = jobTypeFilterActive
          ? (() => {
              if (item.type === "role") {
                const roleJobTypes =
                  roleJobTypesMap.get(String((item as RoleType).id)) ?? [];
                return roleJobTypes.some((jt) =>
                  allowedJobTypesCanonical.includes(jt),
                );
              }
              const cid = String((item as CompanyType).id);
              const jobTypes = companyJobTypesMap.get(cid) ?? [];
              return jobTypes.some((jt) =>
                allowedJobTypesCanonical.includes(jt),
              );
            })()
          : true;

        // Pay range filter: use minPay(default 0) and maxPay(default Infinity)
        const minPay = typeof filters.minPay === "number" ? filters.minPay : 0;
        const maxPay =
          typeof filters.maxPay === "number" ? filters.maxPay : Infinity;

        const payOk = (() => {
          if (item.type === "company") {
            const cid = (item as CompanyType).id;
            const avg = companyAvgPayMap.get(cid) ?? 0;
            return avg >= minPay && avg <= maxPay;
          }
          const rid = (item as RoleType).id;
          const avg = roleAvgPayMap.get(rid) ?? 0;
          return avg >= minPay && avg <= maxPay;
        })();

        const ratingOk = (() => {
          if (!ratingsFilterActive) return true;
          const allowed = (filters.ratings ?? [])
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n));

          const avg =
            item.type === "company"
              ? (companyAvgRatingMap.get((item as CompanyType).id) ?? 0)
              : (roleAvgRatingMap.get((item as RoleType).id) ?? 0);

          //if ratings is length 1, filter by that rating and above
          return allowed.length === 1
            ? allowed.some((n) => avg >= n)
            : allowed.some((n) => avg >= n && avg <= n + 0.9);
        })();

        const overtimeOk = (() => {
          if (!overtimeWorkFilterActive) return true;
          // If true, show roles where >50% of reviews say overtime is normal
          const percent =
            item.type === "company"
              ? (companyOvertimePercentMap.get((item as CompanyType).id) ?? 0)
              : (roleOvertimePercentMap.get((item as RoleType).id) ?? 0);
          return percent > 0.5;
        })();

        const workHoursOk = (() => {
          if (!workHoursFilterActive) return true;
          const avg =
            item.type === "company"
              ? companyAvgHoursMap.get((item as CompanyType).id)
              : roleAvgHoursMap.get((item as RoleType).id);
          // No reported hours means no data, so it can't match
          if (avg === undefined) return false;
          const minHours = filters.minHours ?? 0;
          const maxHours = filters.maxHours ?? Infinity;
          return avg >= minHours && avg <= maxHours;
        })();

        const onTheJobOk = (() => {
          if (onTheJobFilters.length === 0) return true;
          const shares =
            item.type === "company"
              ? companyOnTheJobSharesMap.get((item as CompanyType).id)
              : roleOnTheJobSharesMap.get((item as RoleType).id);
          // No published reviews means no data, so it can't match
          if (!shares) return false;
          return onTheJobFilters.every((id) => ON_THE_JOB_RULES[id](shares));
        })();

        const workModelsOk = (() => {
          if (!workModelsFilterActive) return true;
          const allowedModels = filters.workModels ?? [];

          const itemModels =
            item.type === "company"
              ? (companyWorkModelsMap.get((item as CompanyType).id) ?? [])
              : (roleWorkModelsMap.get((item as RoleType).id) ?? []);

          // Item passes if any of its work models match the filter
          return itemModels.some((model) => allowedModels.includes(model));
        })();

        return (
          industryOk &&
          locationOk &&
          jobTypeOk &&
          payOk &&
          ratingOk &&
          overtimeOk &&
          workHoursOk &&
          onTheJobOk &&
          workModelsOk
        );
      });

      const fuseOptions = ["title", "description", "companyName", "name"];

      // Apply fuzzy search to the base filtered items (filters applied, excluding `type`)
      const searchedBaseItems = performFuseSearch<
        | (RoleType & { companyName: string; type: "role" })
        | (CompanyType & { type: "company" })
      >(baseFilteredItems, fuseOptions, input.search);

      // Totals should reflect counts after applying filters + text search but excluding `type`.
      const totalRolesCount = searchedBaseItems.filter(
        (item): item is RoleType & { type: "role"; companyName: string } =>
          item.type === "role",
      ).length;

      const totalCompanyCount = searchedBaseItems.filter(
        (item): item is CompanyType & { type: "company" } =>
          item.type === "company",
      ).length;

      // Now apply the `type` filter to determine which items to return (filtering the searched results)
      const postTypeItems = ((): typeof searchedBaseItems => {
        if (input.type === "roles")
          return searchedBaseItems.filter((i) => i.type === "role");
        if (input.type === "companies")
          return searchedBaseItems.filter((i) => i.type === "company");
        return searchedBaseItems;
      })();

      const paginatedItems = postTypeItems.slice(
        input.offset,
        input.offset + input.limit,
      );

      return {
        items: paginatedItems,
        totalCount: searchedBaseItems.length,
        totalRolesCount,
        totalCompanyCount,
      };
    }),

  getPageNumber: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        itemType: z.enum(["role", "company"]),
        sortBy: z
          .enum(["default", "rating", "newest", "oldest"])
          .default("default"),
        search: z.string().optional(),
        type: z.enum(["roles", "companies", "all"]).default("all"),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Fetch all items using the same logic as the list endpoint
      let roles: RoleType[] = [];
      if (input.sortBy === "rating") {
        const rolesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Role}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Role}
          INNER JOIN ${Company} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Review.status} = ${Status.PUBLISHED}
            AND ${Company.hidden} = false
            AND ${Role.hidden} = false
            AND ${Review.hidden} = false
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
        INNER JOIN ${Role} ON ${Review.roleId}::uuid = ${Role.id}
        INNER JOIN ${Company} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
        WHERE ${Company.hidden} = false
          AND ${Role.hidden} = false
          AND ${Review.hidden} = false
          AND ${Review.roleId} != ''
          AND ${Review.roleId} IS NOT NULL
          AND ${Review.status} = ${Status.PUBLISHED}
      `);

        const roleIds = rolesWithReviews.rows.map((row) => String(row.role_id));

        if (roleIds.length === 0) {
          roles = [];
        } else {
          roles = await ctx.db.query.Role.findMany({
            where: (role, { and, eq, inArray }) =>
              and(eq(role.hidden, false), inArray(role.id, roleIds)),
            orderBy: ordering[input.sortBy],
          });
        }
      }

      let companies: CompanyType[] = [];
      if (input.sortBy === "rating") {
        const companiesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Company}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Review.status} = ${Status.PUBLISHED}
            AND ${Company.hidden} = false
            AND ${Review.hidden} = false
            AND ${Role.hidden} = false
          GROUP BY ${Company.id}
          ORDER BY avg_rating DESC
        `);

        companies = companiesWithRatings.rows.map((company) => ({
          ...(company as CompanyType),
        }));
      } else {
        const foundCompanies = await ctx.db.query.Company.findMany({
          orderBy: companyOrdering[input.sortBy],
          where: (company, { eq }) => eq(company.hidden, false),
        });

        const companiesWithReviews = await ctx.db.execute(sql`
          SELECT DISTINCT ${Company.id}::uuid as company_id
          FROM ${Company}
          INNER JOIN ${Role} ON ${Role.companyId}::uuid = ${Company.id}
          INNER JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Company.hidden} = false
            AND ${Role.hidden} = false
            AND ${Review.hidden} = false
            AND ${Review.roleId} != ''
            AND ${Review.roleId} IS NOT NULL
            AND ${Review.status} = ${Status.PUBLISHED}
        `);

        const companyIdsWithReviews = new Set(
          companiesWithReviews.rows.map((row) => String(row.company_id)),
        );

        companies = foundCompanies.filter((company) =>
          companyIdsWithReviews.has(company.id),
        );
      }

      const rolesWithCompanies = roles.map((role) => {
        const company = companies.find((c) => c.id === role.companyId);
        return {
          ...role,
          companyName: company?.name ?? "",
          // Real slug for URLs; names aren't unique (e.g. "google" and
          // "Google" are different companies, slugged google and google-2)
          companySlug: company?.slug,
          type: "role" as const,
        };
      });

      const companiesWithType = companies.map((company) => ({
        ...company,
        type: "company" as const,
      }));

      const combinedItems = input.search
        ? [...companiesWithType, ...rolesWithCompanies]
        : [...rolesWithCompanies, ...companiesWithType];

      const filteredItems = combinedItems.filter((item) => {
        return input.type === "roles"
          ? item.type === "role"
          : input.type === "companies"
            ? item.type === "company"
            : true;
      });

      const fuseOptions = ["title", "description", "companyName", "name"];

      const searchedItems = performFuseSearch<
        | (RoleType & { companyName: string; type: "role" })
        | (CompanyType & { type: "company" })
      >(filteredItems, fuseOptions, input.search);

      // Find the index of the item
      const itemIndex = searchedItems.findIndex(
        (item) => item.id === input.itemId && item.type === input.itemType,
      );

      if (itemIndex === -1) {
        return { page: 1, found: false };
      }

      // Calculate the page number (1-indexed)
      const pageNumber = Math.floor(itemIndex / input.limit) + 1;

      return { page: pageNumber, found: true };
    }),
};
