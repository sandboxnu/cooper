"use client";

import Image from "next/image";
import Link from "next/link";

import type { Session } from "@cooper/auth";
import { authClient } from "@cooper/auth/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { UserRole } from "node_modules/@cooper/db/src/schema/misc";

interface ProfileButtonProps {
  session: Session;
}

export default function ProfileButton({ session }: ProfileButtonProps) {
  const linkElement = (
    <Image
      src={session.user.image ?? "/svg/defaultProfile.svg"}
      width="32"
      height="32"
      alt="Logout"
      className="rounded-full hover:cursor-pointer"
    />
  );

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{linkElement}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="text-center">
            <Link href="/profile">Profile</Link>
          </DropdownMenuLabel>
          {(session.user.role === UserRole.ADMIN ||
            session.user.role === UserRole.DEVELOPER) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-center">
                <Link href="/admin/dashboard">Admin</Link>
              </DropdownMenuLabel>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-center">
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
            >
              Log Out
            </button>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
