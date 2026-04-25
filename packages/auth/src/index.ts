import NextAuth from "next-auth";

import { authConfig } from "./config";

// VERCEL_URL is set automatically on all Vercel deployments (preview + production)
// but lacks the protocol. AUTH_URL is needed for the redirect proxy to correctly
// encode the callback URL in the OAuth state for dynamic preview deployments.
if (process.env.VERCEL_URL && !process.env.AUTH_URL) {
  process.env.AUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export type { Session } from "next-auth";

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { handlers, auth, signIn, signOut };

export {
  invalidateSessionToken,
  validateToken,
  isSecureContext,
} from "./config";
