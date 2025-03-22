import Image from "next/image";
import Link from "next/link";

import type { Session } from "@cooper/auth";
import { signOut } from "@cooper/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

interface ProfileButtonProps {
  session: Session;
}

export default function ProfileButton({ session }: ProfileButtonProps) {
  const linkElement = (
    <>
      {session.user.image ? (
        <Image
          src={session.user.image}
          width="36"
          height="36"
          alt="Logout"
          className="rounded-full"
        />
      ) : (
        <Image
          src={"/svg/defaultProfile.svg"}
          width="36"
          height="36"
          alt="Logout"
          className="rounded-full"
        />
      )}
    </>
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
              <button
                formAction={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                Log Out
              </button>
            </form>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
