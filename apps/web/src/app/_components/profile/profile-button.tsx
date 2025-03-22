import Image from "next/image";
import Link from "next/link";

import type { Session } from "@cooper/auth";

interface ProfileButtonProps {
  session: Session;
}

export default function ProfileButton({ session }: ProfileButtonProps) {
  return (
    <div className="flex h-[2.25rem] w-[2.25rem] items-center justify-center">
      <Link href="/profile">
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
      </Link>
    </div>
  );
}
