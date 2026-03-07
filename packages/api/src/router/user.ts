import { z } from "zod";
import { User } from "@cooper/db/schema";
import { UserRole } from "@cooper/db/schema";
import { protectedProcedure } from "../trpc";
import { eq } from "@cooper/db";

export const userRouter = {
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.nativeEnum(UserRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Optional: enforce uniqueness per email
      const existing = await ctx.db.query.User.findFirst({
        where: (u, { eq }) => eq(u.email, input.email),
      });

      if (existing) {
        // optionally update role instead of throwing
        return ctx.db
        .update(User)
        .set({ role: input.role })
        .where(eq(User.email, input.email))
        .returning();
      }

      return ctx.db
        .insert(User)
        .values({
          email: input.email,
          role: input.role,
        })
        .returning();
    }),
};