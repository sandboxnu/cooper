"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import NewRoleDialog from "./new-role-dialogue";

interface NewRoleCardProps {
  companyId: string;
}

export default function NewRoleCard({ companyId }: NewRoleCardProps) {
  const [authorized, setAuthorized] = useState(false);
  const { data: session } = api.auth.getSession.useQuery();

  useEffect(() => {
    setAuthorized(!!session);
  }, [setAuthorized, session]);

  return (
    <Card
      className={
        "mb-4 flex h-fit w-[100%] flex-col justify-between overflow-hidden rounded-lg outline outline-[0.75px] outline-cooper-gray-150 bg-cooper-gray-100 hover:bg-cooper-gray-100"
      }
    >
      <CardHeader className="mt-1.5 pb-3">
        <CardTitle className="text-md flex items-center justify-center gap-3 space-x-4 md:text-xl">
          {authorized ? "Don't see your role?" : "Sign in to create a new role"}
        </CardTitle>
      </CardHeader>
      <CardContent className="mb-1.5 grid gap-2">
        <NewRoleDialog disabled={!authorized} companyId={companyId} />
      </CardContent>
    </Card>
  );
}
