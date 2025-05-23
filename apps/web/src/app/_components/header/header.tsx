"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import CooperLogo from "../cooper-logo";
import { NewReviewDialog } from "../reviews/new-review/new-review-dialogue";
import SearchFilter from "../search/search-filter";
import MobileHeaderButton from "./mobile-header-button";

interface HeaderProps {
  auth: React.ReactNode;
}

/**
 * This is the header component. (Probably) should use header-layout instead
 * @returns The header component for the website
 */
export default function Header({ auth }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const outerWidth = "min-w-40";

  if (isOpen) {
    return (
      <header className="z-50 flex min-h-[14rem] w-full flex-col justify-start bg-white outline outline-[1.5px] outline-cooper-blue-600">
        <div className="z-10 ml-3 mr-4 flex h-[8dvh] min-h-10 items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-cooper-blue-800 xl:text-4xl">
            cooper
          </h1>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsOpen((prev) => !prev)}
            className="h-6 w-6 border-cooper-blue-600 p-4 text-xl text-cooper-blue-600"
          >
            <span className="translate-y-[-1px]">X</span>
          </Button>
        </div>

        <div className="flex translate-y-8 justify-evenly">
          {/* maybe abstract these buttons into a separate component, but 
          i couldn't find a super clean way to do so due to the auth stuff.
          maybe someone smarter can figure out if it ever comes up */}
          <MobileHeaderButton
            href="/"
            iconSrc="/svg/apartment.svg"
            label="Jobs"
          />
          <MobileHeaderButton
            href="/companies"
            iconSrc="/svg/work.svg"
            label="Companies"
          />
          {/* this auth looks weird when it's logged out, but it's the night before showcase
          so can't do much abt it lmao */}
          <MobileHeaderButton label="Profile">{auth}</MobileHeaderButton>
        </div>
      </header>
    );
  }

  return (
    <header className="z-10 flex h-[8dvh] min-h-20 w-full items-center justify-between gap-4 outline outline-[1.5px] outline-cooper-blue-600">
      {/* Logo + Cooper */}
      <div>
        <Link
          href="/"
          className={cn("flex w-fit items-center justify-center", outerWidth)}
        >
          <div className="z-0 mx-4 flex min-w-[80px] items-end">
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

      <div className="mr-6 hidden flex-shrink grid-cols-2 items-center justify-start gap-6 md:flex">
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
          <Link href="/companies">
            <h2
              className={cn(
                pathname.includes("companies") &&
                  "text-cooper-blue-800 underline underline-offset-8",
              )}
            >
              Companies
            </h2>
          </Link>
          <NewReviewDialog />
        </div>
        {auth}
      </div>

      {/* Mobile new review button and burger button */}
      <div className="justify-right mr-2 flex flex-shrink grid-cols-2 items-center gap-2 md:hidden">
        {/* The new review dialog doesn't properly display in mobile version btw. ts pmo frfr icl twin */}
        <NewReviewDialog />
        {/* was thinking of moving the hamburger menu open/close buttons into one component,
        but I feel like their design is too different to justify doing that. lmk if you think 
        we should tho and i can do that -michael */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Image
            src="/svg/burgerMenu.svg"
            width="32"
            height="32"
            alt="Hamburger Menu"
          />
        </Button>
      </div>
    </header>
  );
}
