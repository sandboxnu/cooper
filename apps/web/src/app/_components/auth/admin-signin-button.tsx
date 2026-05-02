"use client";

import { authClient } from "@cooper/auth/client";

export default function AdminSignInButton() {
  return (
    <button
      type="button"
      onClick={() =>
        authClient.signIn.oauth2({
          providerId: "googleAdmin",
          callbackURL: "/roles",
        })
      }
      className="text-cooper-gray-600 font-bold text-md pb-6 pt-2 w-fit cursor-pointer hover:underline"
    >
      Or continue as admin / coordinator
    </button>
  );
}
