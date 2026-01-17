import { z } from "zod";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { asc, desc, sql } from "@cooper/db";
import { Company, Review, Role } from "@cooper/db/schema";

import { publicProcedure, sortableProcedure } from "../trpc";
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
            companyCulture: z.array(z.string()).optional(),
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
        LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
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

      let companies: CompanyType[] = [];
      if (ctx.sortBy === "rating") {
        const companiesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Company}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          GROUP BY ${Company.id}
          ORDER BY avg_rating DESC
        `);

        companies = companiesWithRatings.rows.map((company) => ({
          ...(company as CompanyType),
        }));
      } else {
        companies = await ctx.db.query.Company.findMany({
          orderBy: companyOrdering[ctx.sortBy],
        });
      }

      const rolesWithCompanies = roles.map((role) => {
        const company = companies.find((c) => c.id === role.companyId);

        return {
          ...role,
          companyName: company?.name ?? "",
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
      const companyCultureFilterActive =
        Array.isArray(filters.companyCulture) &&
        filters.companyCulture.length > 0;
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
      if (jobTypeFilterActive) {
        for (const role of roles) {
          const cid = role.companyId;
          const jobType = role.jobType;
          const arr = companyJobTypesMap.get(cid) ?? [];
          if (!arr.includes(jobType)) {
            arr.push(jobType);
          }
          companyJobTypesMap.set(cid, arr);
        }
      }

      // Build average hourly pay maps for roles and companies so we can filter by pay range
      const roleAvgPayMap = new Map<string, number>();
      const companyAvgPayMap = new Map<string, number>();
      const roleAvgRatingMap = new Map<string, number>();
      const companyAvgRatingMap = new Map<string, number>();
      const roleAvgCultureRatingMap = new Map<string, number>();
      const companyAvgCultureRatingMap = new Map<string, number>();
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
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
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
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
          GROUP BY ${Role.id}
        `);

        for (const row of rolesWithAvgRating.rows) {
          roleAvgRatingMap.set(String(row.id), Number(row.avg_rating ?? 0));
        }

        const rolesWithAvgCultureRating = await ctx.db.execute(sql`
          SELECT
            ${Role.id} AS id,
            COALESCE(AVG(${Review.cultureRating}::float), 0) AS avg_culture_rating
          FROM ${Role}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
          GROUP BY ${Role.id}
        `);

        for (const row of rolesWithAvgCultureRating.rows) {
          roleAvgCultureRatingMap.set(
            String(row.id),
            Number(row.avg_culture_rating ?? 0),
          );
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
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
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
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
          GROUP BY ${Company.id}
        `);

        for (const row of companiesWithAvgRating.rows) {
          companyAvgRatingMap.set(String(row.id), Number(row.avg_rating ?? 0));
        }

        const companiesWithAvgCultureRating = await ctx.db.execute(sql`
          SELECT
            ${Company.id} AS id,
            COALESCE(AVG(${Review.cultureRating}::float), 0) AS avg_culture_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
          GROUP BY ${Company.id}
        `);

        for (const row of companiesWithAvgCultureRating.rows) {
          companyAvgCultureRatingMap.set(
            String(row.id),
            Number(row.avg_culture_rating ?? 0),
          );
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

      // Apply all filters EXCEPT the `type` selector to produce baseFilteredItems
      const baseFilteredItems = combinedItems.filter((item) => {
        const allowedIndustries = filters.industries ?? [];
        const allowedLocations = filters.locations ?? [];
        const allowedJobTypes = filters.jobTypes ?? [];

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
                return allowedJobTypes.includes((item as RoleType).jobType);
              }
              // For companies, check if any of their roles match the job type filter
              const cid = (item as CompanyType).id;
              const jobTypes = companyJobTypesMap.get(cid) ?? [];
              return jobTypes.some((jt) => allowedJobTypes.includes(jt));
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

        const companyCultureOk = (() => {
          if (!companyCultureFilterActive) return true;
          const allowed = (filters.companyCulture ?? [])
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n));

          const avg =
            item.type === "company"
              ? (companyAvgCultureRatingMap.get((item as CompanyType).id) ?? 0)
              : (roleAvgCultureRatingMap.get((item as RoleType).id) ?? 0);

          //if culture ratings is length 1, filter by that rating and above
          return allowed.length === 1
            ? allowed.some((n) => avg >= n)
            : allowed.some((n) => avg >= n && avg <= n + 0.9);
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
          companyCultureOk &&
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
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          GROUP BY ${Role.id}
          ORDER BY avg_rating DESC
        `);

        roles = rolesWithRatings.rows.map((role) => ({
          ...(role as RoleType),
        }));
      } else {
        roles = await ctx.db.query.Role.findMany({
          orderBy: ordering[input.sortBy],
        });
      }

      let companies: CompanyType[] = [];
      if (input.sortBy === "rating") {
        const companiesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Company}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON NULLIF(${Role.companyId}, '')::uuid = ${Company.id}
          LEFT JOIN ${Review} ON NULLIF(${Review.roleId}, '')::uuid = ${Role.id}
          GROUP BY ${Company.id}
          ORDER BY avg_rating DESC
        `);

        companies = companiesWithRatings.rows.map((company) => ({
          ...(company as CompanyType),
        }));
      } else {
        companies = await ctx.db.query.Company.findMany({
          orderBy: companyOrdering[input.sortBy],
        });
      }

      const rolesWithCompanies = roles.map((role) => {
        const company = companies.find((c) => c.id === role.companyId);
        return {
          ...role,
          companyName: company?.name ?? "",
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
