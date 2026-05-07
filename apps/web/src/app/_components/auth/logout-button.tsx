"use client";

import { authClient } from "@cooper/auth/client";
import { Button } from "@cooper/ui/button";

export default function LogoutButton() {
  return (
    <Button
      className="rounded-lg border-none bg-cooper-yellow-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cooper-yellow-300 hover:text-white focus:outline-none focus:ring-4 focus:ring-white"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
    >
      Sign Out
    </Button>
  );
}
