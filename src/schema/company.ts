import { Industry } from "@prisma/client";
import * as z from "zod";

export const createCompanySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  industry: z.nativeEnum(Industry),
  location: z.string(),
});

export const updateCompanySchema = z.object({
  id: z.string(),
  data: createCompanySchema.partial(),
});
