import type { ReactNode } from "react";

import { getSession } from "@cooper/auth";

import Header from "~/app/_components/header/header";
import ProfileButton from "../profile/profile-button";

export default async function HeaderLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const button = session ? <ProfileButton session={session} /> : "";

  return (
    <div className="flex h-screen flex-col overflow-y-auto">
      <div className="top-0 z-50 w-full bg-white">
        <Header auth={button} loggedIn={session} />
      </div>
      <article className="flex min-h-0 flex-1 flex-col items-center justify-start overflow-hidden">
        {children}
      </article>
    </div>
  );
}
