import { z } from "zod";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { asc, desc, sql } from "@cooper/db";
import { Company, Review, Role } from "@cooper/db/schema";

import { sortableProcedure } from "../trpc";
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

      let companies: CompanyType[] = [];
      if (ctx.sortBy === "rating") {
        const companiesWithRatings = await ctx.db.execute(sql`
          SELECT 
            ${Company}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON ${Role.companyId}::uuid = ${Company.id}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
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

      const totalRolesCount = combinedItems.filter(
        (
          item,
        ): item is RoleType & {
          companyName: string;
          type: "role";
          companyIndustry: string;
        } => item.type === "role",
      ).length;

      const totalCompanyCount = combinedItems.filter(
        (item): item is CompanyType & { type: "company" } =>
          item.type === "company",
      ).length;

      const filters = input.filters ?? {};

      const industryFilterActive =
        Array.isArray(filters.industries) && filters.industries.length > 0;
      const locationFilterActive =
        Array.isArray(filters.locations) && filters.locations.length > 0;
      const ratingsFilterActive =
        Array.isArray(filters.ratings) && filters.ratings.length > 0;

      // Build company -> location mapping if location filter is active
      const companyLocationsMap = new Map<string, string[]>();
      if (locationFilterActive) {
        const locationIds = filters.locations!;
        // Query the join table for matching company <-> location rows
        const companyLocRows =
          await ctx.db.query.CompaniesToLocations.findMany();

        for (const r of companyLocRows) {
          // r.companyId / r.locationId come from the CompaniesToLocations schema
          if (!locationIds.includes(r.locationId)) continue;
          const cid = r.companyId;
          const lid = r.locationId;
          const arr = companyLocationsMap.get(cid) ?? [];
          arr.push(lid);
          companyLocationsMap.set(cid, arr);
        }
      }

      // Build average hourly pay maps for roles and companies so we can filter by pay range
      const roleAvgPayMap = new Map<string, number>();
      const companyAvgPayMap = new Map<string, number>();
      const roleAvgRatingMap = new Map<string, number>();
      const companyAvgRatingMap = new Map<string, number>();

      // prepare id lists
      const roleIds = roles.map((r) => r.id);
      const companyIds = companies.map((c) => c.id);

      if (roleIds.length > 0) {
        const rolesWithAvgPay = await ctx.db.execute(sql`
          SELECT
            ${Role.id} AS id,
            COALESCE(AVG(${Review.hourlyPay}::float), 0) AS avg_hourly_pay
          FROM ${Role}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
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
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Role.id} IN (${sql.join(
            roleIds.map((id) => sql`${id}`),
            sql`,`,
          )})
          GROUP BY ${Role.id}
        `);

        for (const row of rolesWithAvgRating.rows) {
          roleAvgRatingMap.set(String(row.id), Number(row.avg_rating ?? 0));
        }
      }

      if (companyIds.length > 0) {
        const companiesWithAvgPay = await ctx.db.execute(sql`
          SELECT
            ${Company.id} AS id,
            COALESCE(AVG(${Review.hourlyPay}::float), 0) AS avg_hourly_pay
          FROM ${Company}
          LEFT JOIN ${Role} ON ${Role.companyId}::uuid = ${Company.id}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
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
          LEFT JOIN ${Role} ON ${Role.companyId}::uuid = ${Company.id}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          WHERE ${Company.id} IN (${sql.join(
            companyIds.map((id) => sql`${id}`),
            sql`,`,
          )})
          GROUP BY ${Company.id}
        `);

        for (const row of companiesWithAvgRating.rows) {
          companyAvgRatingMap.set(String(row.id), Number(row.avg_rating ?? 0));
        }
      }

      const filteredItems = combinedItems.filter((item) => {
        // type filter (roles/companies/all)
        if (input.type === "roles" && item.type !== "role") return false;
        if (input.type === "companies" && item.type !== "company") return false;

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

          return allowed.some((n) => avg >= n && avg <= n + 0.9);
        })();

        return industryOk && locationOk && payOk && ratingOk;
      });

      const fuseOptions = ["title", "description", "companyName", "name"];

      const searchedItems = performFuseSearch<
        | (RoleType & { companyName: string; type: "role" })
        | (CompanyType & { type: "company" })
      >(filteredItems, fuseOptions, input.search);

      const paginatedItems = searchedItems.slice(
        input.offset,
        input.offset + input.limit,
      );

      return {
        items: paginatedItems,
        totalCount: searchedItems.length,
        totalRolesCount,
        totalCompanyCount,
      };
    }),
};
