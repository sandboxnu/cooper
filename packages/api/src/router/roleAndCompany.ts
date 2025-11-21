import { z } from "zod";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "@cooper/db";
import { CompaniesToLocations, Company, Review, Role } from "@cooper/db/schema";

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
            minRating: z.number().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { filters } = input;

      // Build role filters
      let roles: RoleType[] = [];

      if (ctx.sortBy === "rating") {
        // Build WHERE conditions for roles
        const roleConditions: string[] = [];
        const roleParams: any[] = [];

        // Filter by minimum rating
        if (filters?.minRating) {
          roleConditions.push(
            `COALESCE(AVG(${Review.overallRating}::float), 0) >= $${roleParams.length + 1}`,
          );
          roleParams.push(filters.minRating);
        }

        // Filter by hourly pay range
        if (filters?.minPay || filters?.maxPay) {
          if (filters?.minPay) {
            roleConditions.push(
              `COALESCE(AVG(${Review.hourlyPay}::float), 0) >= $${roleParams.length + 1}`,
            );
            roleParams.push(filters.minPay);
          }
          if (filters?.maxPay) {
            roleConditions.push(
              `COALESCE(AVG(${Review.hourlyPay}::float), 0) <= $${roleParams.length + 1}`,
            );
            roleParams.push(filters.maxPay);
          }
        }

        // Filter by job type (work environment)
        if (filters?.jobTypes && filters.jobTypes.length > 0) {
          const placeholders = filters.jobTypes
            .map((_, i) => `$${roleParams.length + i + 1}`)
            .join(",");
          roleConditions.push(`${Review.workEnvironment} IN (${placeholders})`);
          roleParams.push(...filters.jobTypes);
        }

        const whereClause =
          roleConditions.length > 0
            ? `WHERE ${roleConditions.join(" AND ")}`
            : "";

        const rolesWithRatings = await ctx.db.execute(
          sql.raw(`
          SELECT 
            ${Role}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating,
            COALESCE(AVG(${Review.hourlyPay}::float), 0) AS avg_pay
          FROM ${Role}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          GROUP BY ${Role.id}
          ${whereClause}
          HAVING COUNT(${Review.id}) > 0 OR ${whereClause === ""}
          ORDER BY avg_rating DESC
        `),
        );

        roles = rolesWithRatings.rows.map((role) => ({
          ...(role as RoleType),
        }));
      } else {
        // Non-rating sort - build conditions array
        const roleConditions = [];

        // Filter roles by job type if provided
        if (filters?.jobTypes && filters.jobTypes.length > 0) {
          // We need to join with reviews to filter by work environment
          const rolesWithJobType = await ctx.db
            .selectDistinct({ roleId: Review.roleId })
            .from(Review)
            .where(inArray(Review.workEnvironment, filters.jobTypes as any));

          const roleIds = rolesWithJobType
            .map((r) => r.roleId)
            .filter(Boolean) as string[];
          if (roleIds.length > 0) {
            roleConditions.push(inArray(Role.id, roleIds));
          } else {
            // No roles match this filter
            roles = [];
          }
        }

        if (roleConditions.length === 0 || roles.length !== 0) {
          const baseRoles = await ctx.db.query.Role.findMany({
            orderBy: ordering[ctx.sortBy],
            where:
              roleConditions.length > 0 ? and(...roleConditions) : undefined,
          });

          // Filter by pay and rating in memory if needed
          if (filters?.minPay || filters?.maxPay || filters?.minRating) {
            const roleIds = baseRoles.map((r) => r.id);

            // Get average pay and rating for each role
            const rolesWithStats = await Promise.all(
              baseRoles.map(async (role) => {
                const reviews = await ctx.db.query.Review.findMany({
                  where: eq(Review.roleId, role.id),
                });

                const avgRating =
                  reviews.length > 0
                    ? reviews.reduce(
                        (sum, r) => sum + Number(r.overallRating),
                        0,
                      ) / reviews.length
                    : 0;

                const avgPay =
                  reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + Number(r.hourlyPay), 0) /
                      reviews.length
                    : 0;

                return { role, avgRating, avgPay };
              }),
            );

            roles = rolesWithStats
              .filter(({ avgRating, avgPay }) => {
                if (filters?.minRating && avgRating < filters.minRating)
                  return false;
                if (filters?.minPay && avgPay < filters.minPay) return false;
                if (filters?.maxPay && avgPay > filters.maxPay) return false;
                return true;
              })
              .map(({ role }) => role);
          } else {
            roles = baseRoles;
          }
        }
      }

      // Build company filters
      let companies: CompanyType[] = [];

      if (ctx.sortBy === "rating") {
        const companyConditions: string[] = [];
        const companyParams: any[] = [];

        // Filter by minimum rating
        if (filters?.minRating) {
          companyConditions.push(
            `COALESCE(AVG(${Review.overallRating}::float), 0) >= $${companyParams.length + 1}`,
          );
          companyParams.push(filters.minRating);
        }

        // Filter by industry
        if (filters?.industries && filters.industries.length > 0) {
          const placeholders = filters.industries
            .map((_, i) => `$${companyParams.length + i + 1}`)
            .join(",");
          companyConditions.push(`${Company.industry} IN (${placeholders})`);
          companyParams.push(...filters.industries);
        }

        // Filter by location
        if (filters?.locations && filters.locations.length > 0) {
          const placeholders = filters.locations
            .map((_, i) => `$${companyParams.length + i + 1}`)
            .join(",");
          companyConditions.push(`${Company.id} IN (
            SELECT ${CompaniesToLocations.companyId}
            FROM ${CompaniesToLocations}
            WHERE ${CompaniesToLocations.locationId} IN (${placeholders})
          )`);
          companyParams.push(...filters.locations);
        }

        const whereClause =
          companyConditions.length > 0
            ? `WHERE ${companyConditions.join(" AND ")}`
            : "";

        const companiesWithRatings = await ctx.db.execute(
          sql.raw(`
          SELECT 
            ${Company}.*, 
            COALESCE(AVG(${Review.overallRating}::float), 0) AS avg_rating
          FROM ${Company}
          LEFT JOIN ${Role} ON ${Role.companyId}::uuid = ${Company.id}
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
          ${whereClause}
          GROUP BY ${Company.id}
          ORDER BY avg_rating DESC
        `),
        );

        companies = companiesWithRatings.rows.map((company) => ({
          ...(company as CompanyType),
        }));
      } else {
        const companyConditions = [];

        // Filter by industry
        if (filters?.industries && filters.industries.length > 0) {
          companyConditions.push(
            inArray(Company.industry, filters.industries as any),
          );
        }

        // Filter by location
        if (filters?.locations && filters.locations.length > 0) {
          const companiesWithLocations = await ctx.db
            .selectDistinct({ companyId: CompaniesToLocations.companyId })
            .from(CompaniesToLocations)
            .where(inArray(CompaniesToLocations.locationId, filters.locations));

          const companyIds = companiesWithLocations.map((c) => c.companyId);
          if (companyIds.length > 0) {
            companyConditions.push(inArray(Company.id, companyIds));
          } else {
            companies = [];
          }
        }

        if (companyConditions.length === 0 || companies.length !== 0) {
          const baseCompanies = await ctx.db.query.Company.findMany({
            orderBy: companyOrdering[ctx.sortBy],
            where:
              companyConditions.length > 0
                ? and(...companyConditions)
                : undefined,
          });

          // Filter by rating if needed
          if (filters?.minRating) {
            const companiesWithRating = await Promise.all(
              baseCompanies.map(async (company) => {
                const reviews = await ctx.db.query.Review.findMany({
                  where: eq(Review.companyId, company.id),
                });

                const avgRating =
                  reviews.length > 0
                    ? reviews.reduce(
                        (sum, r) => sum + Number(r.overallRating),
                        0,
                      ) / reviews.length
                    : 0;

                return { company, avgRating };
              }),
            );

            companies = companiesWithRating
              .filter(({ avgRating }) => avgRating >= (filters?.minRating ?? 0))
              .map(({ company }) => company);
          } else {
            companies = baseCompanies;
          }
        }
      }

      // Extract unique company IDs from roles
      const companyIds = [...new Set(roles.map((role) => role.companyId))];

      // Fetch companies for roles
      const companiesForRoles = await ctx.db.query.Company.findMany({
        where: (company, { inArray }) => inArray(company.id, companyIds),
      });

      const rolesWithCompanies = roles.map((role) => {
        const company = companiesForRoles.find((c) => c.id === role.companyId);
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

      const totalRolesCount = combinedItems.filter(
        (item): item is RoleType & { companyName: string; type: "role" } =>
          item.type === "role",
      ).length;

      const totalCompanyCount = combinedItems.filter(
        (item): item is CompanyType & { type: "company" } =>
          item.type === "company",
      ).length;

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
          LEFT JOIN ${Review} ON ${Review.roleId}::uuid = ${Role.id}
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
