import type { ReactNode } from "react";

import { auth } from "@cooper/auth";

import Header from "~/app/_components/header";
import LoginButton from "./auth/login-button";
import Footer from "./footer";
import ProfileButton from "./profile/profile-button";
import SearchFilter from "./search/search-filter";

/**
 * This should be used when placing content under the header, standardizes how children are placed under a header.
 * @param param0 Children to pass into the layout
 * @returns A layout component that standardizes the distance from the header
 */
export default async function HeaderLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const button = session ? (
    <ProfileButton session={session} />
  ) : (
    <LoginButton />
  );

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <Header auth={button} />
      <article className="flex h-screen flex-col items-center justify-start">
        <div className="mx-0 mt-2 flex min-h-fit justify-center xl:mt-0 xl:hidden">
          <SearchFilter searchClassName="px-4 mb-2" />
        </div>
        {children}
      </article>
      <Footer />
    </div>
  );
}
