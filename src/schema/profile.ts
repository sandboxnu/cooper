import * as z from "zod";

const MAX_GRADUATION_LENGTH = 6;
const MONTH_LB = 1;
const MONTH_UB = 12;
const YEAR_LB = new Date().getFullYear();
const YEAR_UB = YEAR_LB + MAX_GRADUATION_LENGTH;

export const createProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  major: z.string(),
  minor: z.string().optional(),
  graduationYear: z.number().min(YEAR_LB).max(YEAR_UB),
  graduationMonth: z.number().min(MONTH_LB).max(MONTH_UB),
});

export const updateProfileSchema = z.object({
  id: z.string(),
  data: createProfileSchema.partial(),
});
