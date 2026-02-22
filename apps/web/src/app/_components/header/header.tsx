"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@cooper/ui/button";

import { api } from "~/trpc/react";
import CooperLogo from "../cooper-logo";
import MobileHeaderButton from "./mobile-header-button";

interface HeaderProps {
  auth: React.ReactNode;
}

/**
 * This is the header component. (Probably) should use header-layout instead
 * @returns The header component for the website
 */
export default function Header({ auth }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const session = api.auth.getSession.useQuery();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (pathname === "/review-form") {
      window.dispatchEvent(new CustomEvent("review-form:leave-attempt"));
      return;
    }
    router.push("/");
  };

  if (isOpen) {
    return (
      <header className="bg-cooper-cream-100 z-50 flex min-h-[14rem] w-full flex-col justify-start outline outline-[1px]">
        <div className="z-10 ml-3 mr-4 flex h-[8dvh] min-h-10 items-center justify-between gap-4">
          <Link href="/" onClick={handleLogoClick}>
            <h1 className="text-2xl font-bold text-cooper-blue-800">Cooper</h1>
          </Link>
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
          <MobileHeaderButton
            href="/"
            iconSrc="/svg/apartment.svg"
            label="Jobs"
            onClick={() => setIsOpen(false)}
          />
          <MobileHeaderButton label="Profile" onClick={() => setIsOpen(false)}>
            {auth}
          </MobileHeaderButton>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-cooper-cream-100 outline-cooper-gray-150 z-10 flex w-full items-center justify-between px-6 py-4 outline outline-[1px]">
      <Link
        href="/"
        onClick={handleLogoClick}
        className={"flex items-center justify-center gap-3"}
      >
        <div className="z-0 flex max-w-[43px] items-end">
          <CooperLogo />
        </div>
        <h1 className="text-2xl font-bold text-cooper-blue-800">Cooper</h1>
      </Link>
      <div className="hidden flex-shrink grid-cols-2 items-center justify-center gap-6 md:flex">
        <Link
          href="https://docs.google.com/forms/d/e/1FAIpQLSf-ZvpyBawT5LlMho7X4oNZ0Z_1M-o6cXLJjB5uJiNAvvnkfw/viewform?usp=dialog"
          target="_blank"
          className="text-cooper-gray-250 text-sm hover:underline"
        >
          Submit Feedback or Bug Reports
        </Link>
        {session.data && (
          <div className="flex items-center gap-8">
            <Link href="/review-form">
              <Button className="hover:border-cooper-yellow-700 hover:bg-cooper-yellow-700 h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white">
                <span className="translate-y-[-2px] text-2xl md:hidden">+</span>
                <span className="hidden md:inline">+ ADD REVIEW</span>
              </Button>
            </Link>
          </div>
        )}
        {auth}
      </div>

      {/* Mobile new review button and burger button */}
      <div className="justify-right mr-2 flex flex-shrink grid-cols-2 items-center gap-2 md:hidden">
        {session.data ? (
          <Link href="/review-form">
            <Button className="hover:border-cooper-yellow-700 hover:bg-cooper-yellow-700 h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white">
              <span className="translate-y-[-2px] text-2xl md:hidden">+</span>
            </Button>
          </Link>
        ) : (
          auth
        )}

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
