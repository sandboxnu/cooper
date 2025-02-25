"use client";

import { useEffect, useState } from "react";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";

export default function Roles() {
  const roles = api.role.list.useQuery();

  const [selectedRole, setSelectedRole] = useState<RoleType | undefined>(
    roles.isSuccess ? roles.data[0] : undefined,
  );

  useEffect(() => {
    if (roles.isSuccess) {
      setSelectedRole(roles.data[0]);
    }
  }, [roles.isSuccess, roles.data]);

  return (
    <>
      {roles.isSuccess && roles.data.length > 0 && (
        <div className="flex h-[86dvh] w-full gap-4 divide-x divide-[#474747] pl-4 lg:h-[92dvh]">
          <div className="w-[28%] gap-3 overflow-scroll">
            {roles.data.map((role, i) => {
              return (
                <div key={role.id} onClick={() => setSelectedRole(role)}>
                  <RoleCardPreview
                    reviewObj={role}
                    className={cn(
                      "mb-4 hover:bg-cooper-gray-100",
                      selectedRole
                        ? selectedRole.id === role.id && "bg-cooper-gray-200"
                        : !i && "bg-cooper-gray-200",
                    )}
                  />
                </div>
              );
            })}
          </div>
          <div className="col-span-3 w-[72%] overflow-auto p-1">
            {roles.data.length > 0 && roles.data[0] && (
              <RoleInfo roleObj={selectedRole ?? roles.data[0]} />
            )}
          </div>
        </div>
      )}
      {roles.isSuccess && roles.data.length === 0 && <NoResults />}
      {roles.isPending && <LoadingResults />}
    </>
  );
}
