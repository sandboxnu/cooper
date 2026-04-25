import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import { skipCSRFCheck } from "@auth/core";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";

import { db } from "@cooper/db/client";
import { Account, Session, User, UserRole } from "@cooper/db/schema";

import { env } from "../env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

const adapter = DrizzleAdapter(db, {
  usersTable: User,
  accountsTable: Account,
  sessionsTable: Session,
});

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig = {
  adapter,
  trustHost: true,
  // In development, we need to skip CSRF checks to allow Expo to work
  ...(!isSecureContext ? { skipCSRFCheck: skipCSRFCheck } : {}),
  secret: env.AUTH_SECRET,
  providers: [
    Google({
      id: "google",
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true, // to prevent "To confirm your identity, sign in with the same account you used originally."" error

      authorization: {
        params: {
          hd: "husky.neu.edu",
          prompt: "select_account",
        },
      },
    }),
    Google({
      id: "googleAdmin",
      clientId: env.AUTH_GOOGLE_ADMIN_ID,
      clientSecret: env.AUTH_GOOGLE_ADMIN_SECRET,
      allowDangerousEmailAccountLinking: true, // to prevent "To confirm your identity, sign in with the same account you used originally."" error
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    session: (opts) => {
      if (!("user" in opts))
        throw new Error("unreachable with session strategy");

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
    async signIn({ user, account }) {
      const email = user.email;
      if (!email) {
        return account?.provider === "googleAdmin"
          ? "/?error=unauthorized-admin"
          : "/redirection";
      }

      // Allow anyone who already exists in the DB as admin, coordinator, or developer (any provider, any email)
      const elevatedUser = await db.query.User.findFirst({
        where: (u, { eq, and, or }) =>
          and(
            eq(u.email, email),
            or(
              eq(u.role, UserRole.ADMIN),
              eq(u.role, UserRole.COORDINATOR),
              eq(u.role, UserRole.DEVELOPER),
            ),
          ),
      });

      if (elevatedUser) {
        if (elevatedUser.isDisabled) {
          return "/?error=disabled-account";
        }
        return true;
      }

      // They used the admin/coordinator flow but are not in the DB with an elevated role
      if (account?.provider === "googleAdmin") {
        return "/?error=unauthorized-admin";
      }

      // Regular student Google login: must be a husky.neu.edu email
      if (!email.endsWith("@husky.neu.edu")) {
        return "/redirection";
      }

      // Check if existing student is disabled
      const existingUser = await db.query.User.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });

      if (existingUser?.isDisabled) {
        return "/?error=disabled-account";
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = await adapter.getSessionAndUser?.(sessionToken);
  return session
    ? {
        user: {
          ...session.user,
        },
        expires: session.session.expires.toISOString(),
      }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  await adapter.deleteSession?.(token);
};
