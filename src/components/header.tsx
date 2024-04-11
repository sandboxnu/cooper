import Image from "next/image";
import Link from "next/link";

import LoginButton from "~/components/login-button";
import LogoutButton from "./logout-button";
import { cn } from "~/lib/utils";
import { getServerSession } from "next-auth";
import { Button } from "./ui/button";
import { altivoFont } from "~/styles/font";

/**
 * This is the header component. (Probably) should use header-layout instead
 * @returns The header component for the website
 */
export default async function Header() {
  const session = await getServerSession();

  const outerWidth = "w-40";

  return (
    <header className="flex h-20 w-full grid-cols-3 items-center justify-between border-b border-b-[#9A9A9A] bg-white pr-2 drop-shadow-sm">
      {/* Logo + cooper */}
      <div className={cn("flex flex-grow items-end", outerWidth)}>
        <div className="mx-4 flex min-h-20 items-end">
          <Image
            src="/svg/hidingLogo.svg"
            height={150}
            width={150}
            alt="Logo Picture"
          />
        </div>
        <Link href="/">
          <h1
            className={cn(
              "mb-2 text-5xl font-semibold text-cooper-blue-600",
              altivoFont.className,
            )}
          >
            cooper
          </h1>
        </Link>
      </div>
      {/* Centered Links */}
      <div className="mb-8 flex min-h-20 flex-shrink grid-cols-2 items-end justify-start gap-4">
        <Link href="/roles">
          <h2 className={"font-semibold"}>Jobs</h2>
        </Link>
        <Link href="/companies">
          <h2 className="font-semibold">Companies</h2>
        </Link>
      </div>
      {/* New Review + Profile */}
      <div
        className={cn(
          "mb-8 flex min-h-20 flex-shrink flex-grow items-end justify-end gap-4",
          outerWidth,
        )}
      >
        <Button className="text-md bg-cooper-yellow-500 px-5 py-4 hover:bg-gray-900">
          + Write A Review
        </Button>
        {session ? <LogoutButton /> : <LoginButton />}
      </div>
    </header>
  );
}
function useServerSession() {
  throw new Error("Function not implemented.");
}
