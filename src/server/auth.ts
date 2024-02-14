import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers:
    process.env.VERCEL_ENV === "preview"
      ? [
          CredentialsProvider({
            id: "MOCK_USER",
            name: "Mock User",
            async authorize() {
              return {
                id: "MOCK_USER",
                name: "Mock User",
                email: "mock.user@husky.neu.edu",
                image: "https://i.pravatar.cc/150?u=mock_user",
              };
            },
            credentials: {},
          }),
        ]
      : [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
          }),
          /**
           * ...add more providers here.
           *
           * Most other providers require a bit more work than the Discord provider. For example, the
           * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
           * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
           *
           * @see https://next-auth.js.org/providers/github
           */
        ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
