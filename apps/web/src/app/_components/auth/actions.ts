"use server";

import { signIn, signOut } from "@cooper/auth";

export async function handleGoogleSignIn() {
  await signIn("google", { redirectTo: "/" });
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
