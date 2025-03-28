"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@cooper/ui";

import CooperLogo from "./cooper-logo";
import SearchFilter from "./search/search-filter";

interface HeaderProps {
  auth: React.ReactNode;
}

/**
 * This is the header component. (Probably) should use header-layout instead
 * @returns The header component for the website
 */
export default function Header({ auth }: HeaderProps) {
  const pathname = usePathname();

  const outerWidth = "min-w-40";

  return (
    <header className="flex h-[8dvh] min-h-20 w-full items-center justify-between gap-4 bg-white outline outline-2 outline-cooper-blue-600">
      {/* Logo + Cooper */}
      <div>
        <Link
          href="/"
          className={cn("flex w-fit items-center justify-center", outerWidth)}
        >
          <div className="z-0 mx-4 hidden min-w-[80px] items-end sm:flex">
            <CooperLogo />
          </div>
          <h1 className="text-3xl font-bold text-cooper-blue-600 xl:text-4xl">
            cooper
          </h1>
        </Link>
      </div>

      <div className="hidden lg:block">
        <SearchFilter searchClassName="max-w-[50vw]" />
      </div>

      <div className="mr-6 flex flex-shrink grid-cols-2 items-center justify-start gap-8">
        <Link href="/companies">
          <h2
            className={cn(
              pathname.includes("companies") &&
                "text-cooper-blue-600 underline underline-offset-8",
            )}
          >
            Companies
          </h2>
        </Link>
        <Link href="/">
          <h2
            className={cn(
              pathname.length === 1 &&
                "text-cooper-blue-600 underline underline-offset-8",
            )}
          >
            Jobs
          </h2>
        </Link>
        {auth}
      </div>
    </header>
  );
}
