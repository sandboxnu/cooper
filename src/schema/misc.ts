import * as z from "zod";

export const getByIdSchema = z.object({
  id: z.string(),
});

export const getByNameSchema = z.object({
  name: z.string(),
});

export const getByCompanySchema = z.object({
  companyId: z.string(),
});
