"use client";

import Image from "next/image";
import Link from "next/link";

import type { Session } from "@cooper/auth";
import { authClient } from "@cooper/auth/client";
import { cn } from "@cooper/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { UserRole } from "node_modules/@cooper/db/src/schema/misc";

import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS } from "../shared/menu-styles";

export const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf-ZvpyBawT5LlMho7X4oNZ0Z_1M-o6cXLJjB5uJiNAvvnkfw/viewform?usp=dialog";

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
        <ProfileMenuContent session={session} align="end" />
      </DropdownMenu>
    </div>
  );
}

interface ProfileMenuContentProps {
  session: Session;
  align?: "start" | "center" | "end";
  // Runs before navigating or logging out (e.g. to close the mobile menu)
  onSelect?: () => void;
}

// Menu items shared by the desktop profile button and the mobile header menu
export function ProfileMenuContent({
  session,
  align,
  onSelect,
}: ProfileMenuContentProps) {
  return (
    <DropdownMenuContent
      align={align}
      className={cn(MENU_CONTENT_CLASS, "w-36")}
    >
      <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
        <Link href="/profile" onClick={onSelect}>
          Profile
        </Link>
      </DropdownMenuItem>
      {(session.user.role === UserRole.ADMIN ||
        session.user.role === UserRole.DEVELOPER) && (
        <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
          <Link href="/admin/dashboard" onClick={onSelect}>
            Admin
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
        <Link href={FEEDBACK_FORM_URL} target="_blank" onClick={onSelect}>
          Submit feedback or bug reports
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="mx-2 bg-cooper-gray-150" />
      <DropdownMenuItem
        className={MENU_ITEM_CLASS}
        onSelect={async () => {
          onSelect?.();
          await authClient.signOut();
          window.location.href = "/";
        }}
      >
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
