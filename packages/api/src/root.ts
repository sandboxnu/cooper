import {
  authRouter,
  companyRouter,
  locationRouter,
  profileRouter,
  reviewRouter,
  roleRouter,
} from "./router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  company: companyRouter,
  role: roleRouter,
  profile: profileRouter,
  review: reviewRouter,
  location: locationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
