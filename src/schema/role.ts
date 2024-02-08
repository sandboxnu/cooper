import * as z from "zod";

export const getByTitleSchema = z.object({
  title: z.string(),
});

export const createRoleSchema = z.object({
  title: z.string(),
  description: z.string(),
  companyId: z.string(),
});

export const updateRoleSchema = z.object({
  id: z.string(),
  data: createRoleSchema.partial(),
});
