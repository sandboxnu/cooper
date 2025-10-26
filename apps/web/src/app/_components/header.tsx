"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@cooper/ui";

import CooperLogo from "./cooper-logo";
import { NewReviewDialog } from "./reviews/new-review/new-review-dialogue";
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
    <header className="z-10 flex h-[8dvh] min-h-20 w-full items-center justify-between gap-4 overflow-scroll outline outline-[1.5px] outline-cooper-blue-600">
      {/* Logo + Cooper */}
      <div>
        <Link
          href="/"
          className={cn("flex w-fit items-center justify-center", outerWidth)}
        >
          <div className="z-0 mx-4 hidden min-w-[80px] items-end sm:flex">
            <CooperLogo />
          </div>
          <h1 className="text-3xl font-bold text-cooper-blue-800 xl:text-4xl">
            cooper
          </h1>
        </Link>
      </div>

      <div className="hidden xl:block">
        <SearchFilter searchClassName="max-w-[50vw]" />
      </div>

      <div className="mr-6 flex flex-shrink grid-cols-2 items-center justify-start gap-6">
        <div className="flex items-center justify-start gap-8">
          <Link href="/">
            <h2
              className={cn(
                pathname.length === 1 &&
                  "text-cooper-blue-800 underline underline-offset-8",
              )}
            >
              Jobs
            </h2>
          </Link>
          <NewReviewDialog />
        </div>
        {auth}
      </div>
    </header>
  );
}
