import Image from "next/image";

import type { Session } from "@cooper/auth";
import { signOut } from "@cooper/auth";

interface ProfileButtonProps {
  session: Session;
}

export default function ProfileButton({ session }: ProfileButtonProps) {
  return (
    <form className="flex h-[2.25rem] w-[2.25rem] items-center justify-center">
      {/* TODO: make this link to a profile page */}
      <button
        formAction={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
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
      </button>
    </form>
  );
}
