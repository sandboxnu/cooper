"use client";

import { useSearchParams } from "next/navigation";

import type { RoleType } from "@cooper/db/schema";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";

export default function Role() {
  const searchParams = useSearchParams();
  const roleId = searchParams.get("id");

  const role = api.role.getById.useQuery({ id: roleId ?? "" });

  return (
    <>
      {role.isSuccess && (
        <div className="flex w-full justify-center max-h-[90-dvh] overflow-y-auto p-1">
          <RoleInfo
            roleObj={role.data as RoleType}
            className="w-full md:w-[72%]"
          />
        </div>
      )}
      {role.isPending && (
        <div>
          <LoadingResults />
        </div>
      )}
      {!role.isPending && !role.isSuccess && (
        <div>
          <NoResults />
        </div>
      )}
    </>
  );
}
