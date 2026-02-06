import { redirect } from "next/navigation";

import { auth } from "@cooper/auth";
import { CustomToaster } from "@cooper/ui";
import HeaderLayout from "~/app/_components/header/header-layout";

export const dynamic = "force-dynamic";

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

  return (
    <HeaderLayout>
      {children}
      <CustomToaster />
    </HeaderLayout>
  );
}
