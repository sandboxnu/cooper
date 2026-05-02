import { headers } from "next/headers";
import { redirect } from "next/navigation";

export {
  auth,
  isSecureContext,
  validateToken,
  invalidateSessionToken,
} from "./auth";
export type { Session } from "./auth";

export async function getSession() {
  const { auth } = await import("./auth");
  return auth.api.getSession({ headers: await headers() });
}

export async function signIn(provider: string, opts?: { redirectTo?: string }) {
  const { auth } = await import("./auth");
  const response = await auth.api.signInSocial({
    body: { provider, callbackURL: opts?.redirectTo ?? "/" },
    headers: await headers(),
  });
  if (response.url) redirect(response.url);
}

export async function signOut(opts?: { redirectTo?: string }) {
  const { auth } = await import("./auth");
  await auth.api.signOut({ headers: await headers() });
  redirect(opts?.redirectTo ?? "/");
}
