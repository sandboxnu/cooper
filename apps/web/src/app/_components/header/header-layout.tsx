import type { ReactNode } from "react";

import { auth } from "@cooper/auth";

import Header from "~/app/_components/header/header";
import LoginButton from "../auth/login-button";
import ProfileButton from "../profile/profile-button";

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
      <div className=" top-0 z-50 w-full bg-white">
        <Header auth={button} />
      </div>
      <article className="flex h-fit flex-col items-center justify-start">
        {children}
      </article>
    </div>
  );
}
