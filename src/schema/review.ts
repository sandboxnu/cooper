import { WorkEnvironment, WorkTerm } from "@prisma/client";
import * as z from "zod";

export const getByRoleSchema = z.object({
  roleId: z.string(),
});

export const getByProfileSchema = z.object({
  profileId: z.string(),
});

export const createReviewSchema = z.object({
  workTerm: z.nativeEnum(WorkTerm),
  workYear: z.number(),
  overallRating: z.number().min(1).max(5),
  cultureRating: z.number().min(1).max(5),
  supervisorRating: z.number().min(1).max(5),
  interviewRating: z.number().min(1).max(5),
  interviewDifficulty: z.number().min(1).max(5),
  interviewReview: z.string().optional(),
  reviewHeadline: z.string(),
  textReview: z.string(),
  location: z.string().optional(),
  hourlyPay: z.number().optional(),
  workEnvironment: z.nativeEnum(WorkEnvironment),
  drugTest: z.boolean(),
  overtimeNormal: z.boolean(),
  pto: z.boolean(),
  federalHolidays: z.boolean(),
  freeLunch: z.boolean(),
  freeTransport: z.boolean(),
  freeMerch: z.boolean(),
  otherBenefits: z.string(),
  roleId: z.string(),
  profileId: z.string(),
});

export const updateReviewSchema = z.object({
  id: z.string(),
  data: createReviewSchema.partial(),
});
