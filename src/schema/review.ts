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
  hourlyPay: z.number().min(0),
  interviewDifficulty: z.number().min(1).max(5),
  interviewExperience: z.number().min(1).max(5),
  supervisorRating: z.number().min(1).max(5),
  cultureRating: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5),
  textReview: z.string(),
  workEnvironment: z.nativeEnum(WorkEnvironment),
  freeLunch: z.boolean(),
  drugTest: z.boolean(),
  federalHolidays: z.boolean(),
  overtimeNormal: z.boolean(),
  roleId: z.string(),
  profileId: z.string(),
});

export const updateReviewSchema = z.object({
  id: z.string(),
  data: createReviewSchema.partial(),
});
