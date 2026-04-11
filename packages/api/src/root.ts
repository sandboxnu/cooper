import {
  adminRouter,
  authRouter,
  companyRouter,
  companyToLocationRouter,
  locationRouter,
  profileRouter,
  reportRouter,
  reviewRouter,
  roleAndCompanyRouter,
  roleRouter,
  toolRouter,
  userRouter,
} from "./router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  auth: authRouter,
  company: companyRouter,
  role: roleRouter,
  profile: profileRouter,
  report: reportRouter,
  review: reviewRouter,
  location: locationRouter,
  companyToLocation: companyToLocationRouter,
  roleAndCompany: roleAndCompanyRouter,
  tool: toolRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
