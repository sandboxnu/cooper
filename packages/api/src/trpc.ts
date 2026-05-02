import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

import type { Session } from "@cooper/auth";
import { auth } from "@cooper/auth";
import { db } from "@cooper/db/client";

/**
 * Isomorphic Session getter for API requests
 * - Expo requests will have a session token in the Authorization header
 * - Next.js requests will have a session token in cookies
 * better-auth handles both natively via auth.api.getSession
 */
const isomorphicGetSession = (headers: Headers) =>
  auth.api.getSession({ headers });

export const createTRPCContext = async (opts: {
  headers: Headers;
  session: Session | null;
  res?: Response;
}) => {
  const authToken = opts.headers.get("Authorization") ?? null;
  const session = opts.session ?? (await isomorphicGetSession(opts.headers));
  const source = opts.headers.get("x-trpc-source") ?? "unknown";
  console.log(">>> tRPC Request from", source, "by", session?.user);

  return {
    session,
    db,
    token: authToken,
    res: opts.res,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const sortableProcedure = t.procedure
  .input(
    z
      .object({
        sortBy: z.enum(["default", "rating", "newest", "oldest"]).optional(),
      })
      .optional(),
  )
  .use(({ ctx, input, next }) => {
    return next({
      ctx: {
        session: { ...ctx.session },
        sortBy: input?.sortBy ?? "default",
      },
    });
  });
