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

export async function signInAsPreviewUser(opts?: { redirectTo?: string }) {
  const { auth, isPreviewEnv, PREVIEW_USER_EMAIL, PREVIEW_USER_PASSWORD } =
    await import("./auth");

  if (!isPreviewEnv) {
    throw new Error("signInAsPreviewUser called outside preview environment");
  }

  try {
    await auth.api.signInEmail({
      body: { email: PREVIEW_USER_EMAIL, password: PREVIEW_USER_PASSWORD },
      headers: await headers(),
    });
  } catch {
    await auth.api.signUpEmail({
      body: {
        email: PREVIEW_USER_EMAIL,
        password: PREVIEW_USER_PASSWORD,
        name: "Preview User",
      },
      headers: await headers(),
    });
  }
  redirect(opts?.redirectTo ?? "/");
}

export async function signOut(opts?: { redirectTo?: string }) {
  const { auth } = await import("./auth");
  await auth.api.signOut({ headers: await headers() });
  redirect(opts?.redirectTo ?? "/");
}
