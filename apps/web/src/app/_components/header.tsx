"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Session } from "@cooper/auth";
import { cn } from "@cooper/ui";

import { NewReviewDialog } from "~/app/_components/reviews/new-review-dialogue";
import { altivoFont } from "~/app/styles/font";

interface HeaderProps {
  session: Session | null;
  auth: React.ReactNode;
}

/**
 * This is the header component. (Probably) should use header-layout instead
 * @returns The header component for the website
 */
export default function Header({ session, auth }: HeaderProps) {
  const pathname = usePathname();

  const outerWidth = "w-40";

  return (
    <header className="flex h-20 w-full grid-cols-3 items-center justify-between border-b border-b-[#9A9A9A] bg-white pr-2 drop-shadow-sm">
      {/* Logo + Cooper */}
      <Link href="/" className={cn("flex flex-grow items-end", outerWidth)}>
        <div className="mx-4 flex h-20 items-end">
          <Image
            src="/svg/hidingLogo.svg"
            alt="Logo Picture"
            width={137}
            height={60}
          />
        </div>
        <h1
          className={cn(
            "mb-2 hidden text-5xl font-semibold text-cooper-blue-600 lg:block",
            altivoFont.className,
          )}
        >
          cooper
        </h1>
      </Link>
      {/* Centered Links */}
      <div className="flex min-h-20 flex-shrink grid-cols-2 items-end justify-start gap-4 lg:gap-12">
        <Link href="/roles">
          <h2
            className={cn(
              "mb-[1.375rem] font-semibold",
              pathname.includes("roles") &&
                "mb-0 after:mt-4 after:block after:h-1.5 after:w-full after:rounded-t-full after:bg-cooper-pink-500",
            )}
          >
            Jobs
          </h2>
        </Link>
        <Link href="/companies">
          <h2
            className={cn(
              "mb-[1.375rem] font-semibold",
              pathname.includes("companies") &&
                "mb-0 after:mt-4 after:block after:h-1.5 after:w-full after:rounded-t-full after:bg-cooper-green-500",
            )}
          >
            Companies
          </h2>
        </Link>
      </div>
      {/* New Review + Profile */}
      <div
        className={cn(
          "mb-8 flex min-h-20 flex-shrink flex-grow items-end justify-end gap-4",
          outerWidth,
        )}
      >
        {/* TODO: only show this if the user is below the max number of reviews allowed */}
        {session && <NewReviewDialog />}
        {auth}
      </div>
    </header>
  );
}
