import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@cooper/db";
import { CreateProfileSchema, Profile } from "@cooper/db/schema";

import {
  CreateProfileToCompanySchema,
  ProfilesToCompanies,
} from "../../../db/src/schema/profilesToCompanies";
import {
  CreateProfileToRoleSchema,
  ProfilesToRoles,
} from "../../../db/src/schema/profilesToRoles";
import {
  CreateProfileToReviewSchema,
  ProfilesToReviews,
} from "../../../db/src/schema/profliesToReviews";
import { protectedProcedure, publicProcedure } from "../trpc";

export const profileRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Profile.findMany({
      orderBy: desc(Profile.id),
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Profile.findFirst({
        where: eq(Profile.id, input.id),
      });
    }),

  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Profile.findFirst({
      where: eq(Profile.userId, ctx.session.user.id),
    });
  }),

  create: protectedProcedure
    .input(CreateProfileSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Profile).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Profile).where(eq(Profile.id, input));
  }),

  favoriteCompany: protectedProcedure
    .input(CreateProfileToCompanySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(ProfilesToCompanies).values({
        profileId: input.profileId,
        companyId: input.companyId,
      });
    }),

  unfavoriteCompany: protectedProcedure
    .input(z.object({ profileId: z.string(), companyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(ProfilesToCompanies)
        .where(
          and(
            eq(ProfilesToCompanies.profileId, input.profileId),
            eq(ProfilesToCompanies.companyId, input.companyId),
          ),
        );
    }),

  favoriteRole: protectedProcedure
    .input(CreateProfileToRoleSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(ProfilesToRoles).values({
        profileId: input.profileId,
        roleId: input.roleId,
      });
    }),

  unfavoriteRole: protectedProcedure
    .input(z.object({ profileId: z.string(), roleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(ProfilesToRoles)
        .where(
          and(
            eq(ProfilesToRoles.profileId, input.profileId),
            eq(ProfilesToRoles.roleId, input.roleId),
          ),
        );
    }),

  favoriteReview: protectedProcedure
    .input(CreateProfileToReviewSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(ProfilesToReviews).values({
        profileId: input.profileId,
        reviewId: input.reviewId,
      });
    }),

  unfavoriteReview: protectedProcedure
    .input(z.object({ profileId: z.string(), reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(ProfilesToReviews)
        .where(
          and(
            eq(ProfilesToReviews.profileId, input.profileId),
            eq(ProfilesToReviews.reviewId, input.reviewId),
          ),
        );
    }),

  listFavoriteCompanies: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(ProfilesToCompanies)
        .where(eq(ProfilesToCompanies.profileId, input.profileId));
    }),

  listFavoriteRoles: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(ProfilesToRoles)
        .where(eq(ProfilesToRoles.profileId, input.profileId));
    }),

  listFavoriteReviews: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(ProfilesToReviews)
        .where(eq(ProfilesToReviews.profileId, input.profileId));
    }),
} satisfies TRPCRouterRecord;
