"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";

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
        <div className="flex h-[86dvh] w-full divide-x-[0.75px] divide-cooper-gray-300 lg:h-[92dvh]">
          {/* TODO: Confirm what background color we want to use here with the designers */}
          <div className="w-[28%] gap-3 overflow-auto bg-cooper-gray-100 p-5">
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger className="text-md mb-2">
                  Sort By{" "}
                  <span className="underline">
                    {selectedFilter &&
                      selectedFilter.charAt(0).toUpperCase() +
                        selectedFilter.slice(1)}
                  </span>
                  <ChevronDown className="inline" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="flex flex-col text-center">
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
                        ? selectedRole.id === role.id &&
                            "bg-cooper-gray-200 hover:bg-cooper-gray-200"
                        : !i && "bg-cooper-gray-200 hover:bg-cooper-gray-200",
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
      {roles.isSuccess && roles.data.length === 0 && (
        <NoResults className="h-full" />
      )}
      {roles.isPending && <LoadingResults className="h-full" />}
    </>
  );
}
