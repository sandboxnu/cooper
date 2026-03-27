"use client";

import { UserRole } from "@cooper/db/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    data: session,
    isLoading: sessionLoading,
    error: _sessionError,
  } = api.auth.getSession.useQuery();

  if (
    !sessionLoading &&
    session?.user.role &&
    session.user.role !== UserRole.ADMIN &&
    session.user.role !== UserRole.DEVELOPER
  ) {
    router.replace("/404");
    return null;
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="border-b bg-white px-6 py-3">
        <div className="flex gap-4 text-sm">
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin/user-manager">User Manager</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
