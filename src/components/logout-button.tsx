"use client";

import { Button } from "~/components/ui/button";
import { signOut } from "next-auth/react";

export default async function LogoutButton() {
  return (
    <Button
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
      type="button"
      className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
    >
      Sign Out
    </Button>
  );
}
