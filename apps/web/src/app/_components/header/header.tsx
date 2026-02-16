"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { Button } from "@cooper/ui/button";

import { api } from "~/trpc/react";
import { handleSignOut } from "../auth/actions";
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
  const session = api.auth.getSession.useQuery();

  if (isOpen) {
    return (
      <header className="z-50 flex min-h-[14rem] w-full flex-col justify-start bg-cooper-cream-100 outline outline-[1px]">
        <div className="z-10 ml-3 mr-4 flex h-[8dvh] min-h-10 items-center justify-between gap-4">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
          >
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
          {session.data ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="my-1 flex h-20 w-20 flex-col gap-1 border-cooper-blue-600 text-sm text-cooper-blue-600"
                >
                  <Image
                    src={session.data.user.image ?? "/svg/defaultProfile.svg"}
                    width={32}
                    height={32}
                    alt="Profile"
                    className="rounded-full"
                  />
                  <span>Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel className="text-center">
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    Profile
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-center">
                  <form>
                    <button
                      type="submit"
                      formAction={handleSignOut}
                      onClick={() => setIsOpen(false)}
                    >
                      Log Out
                    </button>
                  </form>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <MobileHeaderButton label="" onClick={() => setIsOpen(false)}>
              {auth}
            </MobileHeaderButton>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="z-10 flex w-full items-center justify-between px-6 py-4 outline outline-[1px] bg-cooper-cream-100 outline-cooper-gray-150">
      <Link
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = "/";
        }}
        className={"flex items-center justify-center gap-3"}
      >
        <div className="z-0 flex max-w-[43px] items-end">
          <CooperLogo />
        </div>
        <h1 className="text-2xl font-bold text-cooper-blue-800 ">Cooper</h1>
      </Link>
      <div className="hidden flex-shrink grid-cols-2 items-center justify-center gap-6 md:flex">
        <Link
          href="https://docs.google.com/forms/d/e/1FAIpQLSf-ZvpyBawT5LlMho7X4oNZ0Z_1M-o6cXLJjB5uJiNAvvnkfw/viewform?usp=dialog"
          target="_blank"
          className="text-sm text-cooper-gray-250 hover:underline"
        >
          Submit Feedback or Bug Reports
        </Link>
        {session.data && (
          <div className="flex items-center gap-8">
            <Link href="/review-form">
              <Button className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:border-cooper-yellow-700 hover:bg-cooper-yellow-700">
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
            <Button className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:border-cooper-yellow-700 hover:bg-cooper-yellow-700">
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
