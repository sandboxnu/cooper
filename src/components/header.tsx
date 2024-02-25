import Image from "next/image";

import LoginButton from "./login-button";
import LogoutButton from "./logout-button";

export default async function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border border-blue-500 bg-cooper-blue-400 p-4">
      <h1 className="text-3xl font-extrabold text-white">COOPER</h1>
      <LoginButton />
      <LogoutButton />
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
