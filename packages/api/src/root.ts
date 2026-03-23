import {
  authRouter,
  companyRouter,
  companyToLocationRouter,
  locationRouter,
  profileRouter,
  reportRouter,
  reviewRouter,
  roleAndCompanyRouter,
  roleRouter,
  userRouter,
} from "./router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  company: companyRouter,
  role: roleRouter,
  profile: profileRouter,
  report: reportRouter,
  review: reviewRouter,
  location: locationRouter,
  companyToLocation: companyToLocationRouter,
  roleAndCompany: roleAndCompanyRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
