import Image from "next/image";
import Link from "next/link";

import LoginButton from "~/components/login-button";
import LogoutButton from "./logout-button";
import { getServerSession } from "next-auth";

export default async function Header() {
  const session = await getServerSession();

  return (
    <header className="flex h-16 w-full items-center justify-between bg-cooper-blue-400 p-4">
      <Link href="/">
        <h1 className="text-3xl font-extrabold text-white">COOPER</h1>
      </Link>
      {session ? <LogoutButton /> : <LoginButton />}
      <div className="mt-2">
        <Image
          src="/svg/logo.svg"
          width={100}
          height={100}
          alt="Logo Picture"
        />
      </div>
    </header>
  );
}
