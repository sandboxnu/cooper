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
    <div className="flex h-screen flex-col justify-between">
      <Header auth={button} />
      <article className="mt-4 flex h-[92dvh] w-screen flex-col items-center justify-center">
        <div className="m-4 mt-0 flex h-[6dvh] justify-center lg:hidden">
          <SearchFilter searchClassName="w-screen px-4" />
        </div>
        {children}
      </article>
      <Footer />
    </div>
  );
}
