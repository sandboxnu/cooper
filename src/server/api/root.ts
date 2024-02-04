import { createTRPCRouter } from "~/server/api/trpc";
import { roleRouter } from "~/server/api/routers/role";
import { profileRouter } from "~/server/api/routers/profile";
import { reviewRouter } from "~/server/api/routers/review";
import { companyRouter } from "~/server/api/routers/company";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  role: roleRouter,
  profile: profileRouter,
  review: reviewRouter,
  company: companyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
