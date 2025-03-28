"use client";

import { useState } from "react";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { Button } from "@cooper/ui/button";
import { ChevronDown } from "lucide-react";

export default function Roles() {
  const [selectedFilter, setSelectedFilter] = useState<
    "default" | "rating" | "newest" | "oldest" | undefined
  >("default");
  const roles = api.role.list.useQuery({ sortBy: selectedFilter });
  const buttonStyle =
    "bg-white hover:bg-cooper-gray-200 border-white text-black p-2";

  const [selectedRole, setSelectedRole] = useState<RoleType | undefined>(
    roles.isSuccess ? roles.data[0] : undefined,
  );

  return (
    <>
      {roles.isSuccess && roles.data.length > 0 && (
        <div className="flex h-[86dvh] w-full gap-4 divide-x divide-[#474747] pl-4 lg:h-[92dvh] ">
          <div className="w-[28%] gap-3 overflow-auto p-1">
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger className="pb-2 text-md">
                  Sort By <span className="underline">{selectedFilter}</span>
                  <ChevronDown className="inline" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="text-center flex flex-col">
                    <Button
                      className={buttonStyle}
                      onClick={() => setSelectedFilter("default")}
                    >
                      Default
                    </Button>
                    <Button
                      className={buttonStyle}
                      onClick={() => setSelectedFilter("newest")}
                    >
                      Newest
                    </Button>
                    <Button
                      className={buttonStyle}
                      onClick={() => setSelectedFilter("oldest")}
                    >
                      Oldest
                    </Button>
                    <Button
                      className={buttonStyle}
                      onClick={() => setSelectedFilter("rating")}
                    >
                      Rating
                    </Button>
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
