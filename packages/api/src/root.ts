import {
  authRouter,
  companyRouter,
  companyToLocationRouter,
  locationRouter,
  profileRouter,
  reviewRouter,
  roleAndCompanyRouter,
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
  companyToLocation: companyToLocationRouter,
  roleAndCompany: roleAndCompanyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
