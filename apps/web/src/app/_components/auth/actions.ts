"use server";

import { signIn, signInAsPreviewUser, signOut } from "@cooper/auth";

export async function handleGoogleSignIn() {
  await signIn("google", { redirectTo: "/" });
}

export async function handlePreviewSignIn() {
  await signInAsPreviewUser({ redirectTo: "/" });
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
