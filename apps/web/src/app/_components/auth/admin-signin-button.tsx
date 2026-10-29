"use client";

import { authClient } from "@cooper/auth/client";

export default function AdminSignInButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        const result = await authClient.signIn.social({
          provider: "googleAdmin",
          callbackURL: "/roles",
        });
        if (result.error) {
          console.error("[AdminSignInButton] sign-in error", result.error);
        }
      }}
      className="text-cooper-gray-600 text-left font-bold text-md w-fit cursor-pointer hover:underline"
    >
      Or continue as admin / coordinator
    </button>
  );
}
