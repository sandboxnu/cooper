import { redirect } from "next/navigation";

import { auth } from "@cooper/auth";
import { CustomToaster } from "@cooper/ui";

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
    <>
      {children}
      <CustomToaster />
    </>
  );
}
