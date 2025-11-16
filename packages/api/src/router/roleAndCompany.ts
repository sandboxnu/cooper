import { z } from "zod";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { asc, desc, sql } from "@cooper/db";
import { Review, Role, Company } from "@cooper/db/schema";

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
