"use client";

import { Button } from "~/components/ui/button";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <Button
      type="button"
      className="rounded-lg bg-cooper-blue-400 px-5 py-2.5 text-sm font-medium text-white hover:bg-cooper-blue-200 hover:text-cooper-blue-600 focus:outline-none focus:ring-4 focus:ring-white"
      onClick={() => signIn("google")}
    >
      Sign In
    </Button>
  );
}
