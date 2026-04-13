import { redirect } from "next/navigation";

import { auth } from "@cooper/auth";
import { db } from "@cooper/db/client";
import { CustomToaster } from "@cooper/ui";

import HeaderLayout from "~/app/_components/header/header-layout";

export default async function ProtectedLayour({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const user = await db.query.User.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
  });

  if (user?.isDisabled) {
    redirect("/");
  }

  return (
    <HeaderLayout>
      {children}
      <CustomToaster />
    </HeaderLayout>
  );
}
