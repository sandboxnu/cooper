import { createTRPCRouter } from "~/server/api/trpc";
import { roleRouter } from "~/server/api/routers/roleRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  role: roleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
