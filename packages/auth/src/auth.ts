import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, oAuthProxy } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@cooper/db/client";
import {
  Account,
  Session as SessionTable,
  User,
  UserRole,
  Verification,
} from "@cooper/db/schema";

import { env } from "../env";

export const isSecureContext = env.NODE_ENV !== "development";

const baseURL =
  env.AUTH_URL ??
  (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");

const trustedOrigins = [
  baseURL,
  ...(env.VERCEL_URL ? [`https://${env.VERCEL_URL}`] : []),
  ...(env.VERCEL_BRANCH_URL ? [`https://${env.VERCEL_BRANCH_URL}`] : []),
  "http://localhost:3000",
];

console.log("[auth] AUTH_URL env:", env.AUTH_URL);
console.log("[auth] VERCEL_URL:", env.VERCEL_URL);
console.log("[auth] VERCEL_BRANCH_URL:", env.VERCEL_BRANCH_URL);
console.log("[auth] baseURL:", baseURL);
console.log("[auth] trustedOrigins:", trustedOrigins);
console.log("[auth] google redirectURI:", `${baseURL}/api/auth/callback/google`);
console.log(
  "[auth] googleAdmin redirectURI:",
  `${baseURL}/api/auth/callback/googleAdmin`,
);

export const auth = betterAuth({
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: User,
      account: Account,
      session: SessionTable,
      verification: Verification,
    },
  }),
  secret: env.AUTH_SECRET,
  baseURL,

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "googleAdmin"],
    },
  },

  advanced: {
    database: {
      // User.id is uuid type — must generate proper UUIDs, not better-auth's default 32-char strings
      generateId: () => crypto.randomUUID(),
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: UserRole.STUDENT,
        input: false,
      },
      isDisabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  plugins: [
    oAuthProxy({
      productionURL: env.AUTH_URL,
    }),
    genericOAuth({
      config: [
        {
          providerId: "google",
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
          authorizationUrl:
            "https://accounts.google.com/o/oauth2/v2/auth?hd=husky.neu.edu",
          tokenUrl: "https://oauth2.googleapis.com/token",
          userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
          redirectURI: `${baseURL}/api/auth/callback/google`,
          scopes: ["openid", "email", "profile"],
          pkce: true,
          mapProfileToUser: (profile: Record<string, string>) => ({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            emailVerified: profile.email_verified === "true",
          }),
        },
        {
          providerId: "googleAdmin",
          clientId: env.AUTH_GOOGLE_ADMIN_ID,
          clientSecret: env.AUTH_GOOGLE_ADMIN_SECRET,
          authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
          tokenUrl: "https://oauth2.googleapis.com/token",
          userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
          redirectURI: `${baseURL}/api/auth/callback/googleAdmin`,
          scopes: ["openid", "email", "profile"],
          pkce: true,
          mapProfileToUser: (profile: Record<string, string>) => ({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            emailVerified: profile.email_verified === "true",
          }),
        },
      ],
    }),
  ],

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [user, recentAccount] = await Promise.all([
            db.query.User.findFirst({
              where: (u, { eq }) => eq(u.id, session.userId),
            }),
            db.query.Account.findFirst({
              where: (a, { eq }) => eq(a.userId, session.userId),
              orderBy: (a, { desc }) => [desc(a.updatedAt)],
            }),
          ]);

          if (!user?.email) return false;

          if (user.isDisabled) {
            throw new APIError("FORBIDDEN", { message: "disabled-account" });
          }

          const provider = recentAccount?.providerId;

          if (provider === "googleAdmin") {
            const isElevated =
              user.role === UserRole.ADMIN ||
              user.role === UserRole.COORDINATOR ||
              user.role === UserRole.DEVELOPER;
            if (!isElevated) {
              throw new APIError("FORBIDDEN", {
                message: "unauthorized-admin",
              });
            }
          } else if (
            provider === "google" &&
            !user.email.endsWith("@husky.neu.edu")
          ) {
            throw new APIError("FORBIDDEN", {
              message: "domain-not-allowed",
            });
          }

          return { data: session };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;

export const validateToken = async (token: string) => {
  const sessionToken = token.startsWith("Bearer ") ? token.slice(7) : token;
  return auth.api.getSession({
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
  });
};

export const invalidateSessionToken = async (token: string) => {
  const sessionToken = token.startsWith("Bearer ") ? token.slice(7) : token;
  await db.delete(SessionTable).where(eq(SessionTable.token, sessionToken));
};
