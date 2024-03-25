import Image from "next/image";
import Link from "next/link";

import LoginButton from "~/components/login-button";
import LogoutButton from "./logout-button";
import { getServerSession } from "next-auth";
import localFont from "next/font/local";
import { cn } from "~/lib/utils";

const myFont = localFont({ src: "./../app/fonts/AltivoMedium.otf" });

export default async function Header() {
  const session = await getServerSession();

  return (
    <header className="flex h-24 w-full items-center justify-between bg-cooper-blue-600 pr-2">
      <div className="mx-2 flex items-center">
        <div className="mx-4">
          <Image
            src="/svg/logo.svg"
            width={70}
            height={70}
            alt="Logo Picture"
          />
        </div>
        <Link href="/">
          <h1 className={cn("text-3xl text-white", myFont.className)}>
            COOPER
          </h1>
        </Link>
      </div>
      {session ? <LogoutButton /> : <LoginButton />}
    </header>
  );
}
