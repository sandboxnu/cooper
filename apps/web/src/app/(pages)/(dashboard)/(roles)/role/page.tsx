"use client";

import { useSearchParams } from "next/navigation";

import type { RoleType } from "@cooper/db/schema";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";
import {
  CompareColumns,
  CompareTopBar,
} from "~/app/_components/compare/compare-ui";
import { useCompare } from "~/app/_components/compare/compare-context";

export default function Role() {
  const searchParams = useSearchParams();
  const roleId = searchParams.get("id");
  const compare = useCompare();

  const role = api.role.getById.useQuery({ id: roleId ?? "" });

  return (
    <>
      {role.isSuccess && (
        <div className="flex w-full justify-center overflow-y-auto p-1">
          <div className="w-full md:w-[72%]">
            <div className="flex w-full items-center justify-end px-3 py-2">
              <CompareTopBar anchorRoleId={role.data?.id} />
            </div>
            {compare.isCompareMode ? (
              <CompareColumns anchorRole={role.data as RoleType} />
            ) : (
              <div className="h-[76dvh] md:h-[82dvh] lg:h-[86dvh] overflow-y-auto">
                <RoleInfo roleObj={role.data as RoleType} className="w-full" />
              </div>
            )}
          </div>
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
