"use client";

import Image from "next/image";
import Link from "next/link";

import type { Session } from "@cooper/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { handleSignOut } from "../auth/actions";

interface ProfileButtonClientProps {
  session: Session;
}

export default function ProfileButtonClient({ session }: ProfileButtonClientProps) {
  const linkElement = (
    <Image
      src={session.user.image ?? "/svg/defaultProfile.svg"}
      width="36"
      height="36"
      alt="Profile"
      className="rounded-full"
    />
  );

  return (
    <div className="flex h-[2.25rem] w-[2.25rem] items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{linkElement}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="text-center">
            <Link href="/profile">Profile</Link>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-center">
            <form>
              <button formAction={handleSignOut}>
                Log Out
              </button>
            </form>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}