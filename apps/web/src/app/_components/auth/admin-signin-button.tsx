"use client";

import { authClient } from "@cooper/auth/client";

export default function AdminSignInButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        console.log("[AdminSignInButton] starting oauth2 sign-in");
        const result = await authClient.signIn.oauth2({
          providerId: "googleAdmin",
          callbackURL: "/roles",
        });
        console.log("[AdminSignInButton] sign-in result", result);
        if (result?.error) {
          console.error("[AdminSignInButton] sign-in error", result.error);
        }
      }}
      className="text-cooper-gray-600 font-bold text-md pb-6 pt-2 w-fit cursor-pointer hover:underline"
    >
      Or continue as admin / coordinator
    </button>
  );
}
