"use client";

import type { ReactNode } from "react";

import Header from "~/app/_components/header/header";
import LoginButtonClient from "../auth/login-button-client";
import ProfileButtonClient from "../profile/profile-button-client";
import SearchFilter from "../search/search-filter";
import { api } from "~/trpc/react";

/**
 * Client-side version of HeaderLayout for use in client components.
 * This should be used when placing content under the header in client components.
 * @param param0 Children to pass into the layout
 * @returns A layout component that standardizes the distance from the header
 */
export default function HeaderLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, isLoading } = api.auth.getSession.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col justify-between">
        <div className="flex flex-col">
          <div className="fixed top-0 z-50 w-full bg-white">
            <Header auth={<LoginButtonClient />} />
            <div className="mx-0 mt-2 flex min-h-fit justify-center xl:mt-0 xl:hidden">
              <SearchFilter searchClassName="px-4 mb-2" />
            </div>
          </div>
          <article className="flex h-fit flex-col items-center justify-start xl:pt-[10dvh] pt-[18.5dvh]">
            {children}
          </article>
        </div>
      </div>
    );
  }

  const button = session ? (
    <ProfileButtonClient session={session} />
  ) : (
    <LoginButtonClient />
  );

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="flex flex-col">
        <div className="fixed top-0 z-50 w-full bg-white">
          <Header auth={button} />
          <div className="mx-0 mt-2 flex min-h-fit justify-center xl:mt-0 xl:hidden">
            <SearchFilter searchClassName="px-4 mb-2" />
          </div>
        </div>
        <article className="flex h-fit flex-col items-center justify-start xl:pt-[10dvh] pt-[18.5dvh]">
          {children}
        </article>
      </div>
    </div>
  );
}
