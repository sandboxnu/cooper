import { redirect } from "next/navigation";

import { auth } from "@cooper/auth";
import { Toaster } from "@cooper/ui/toaster";

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
      <Toaster />
    </>
  );
}
