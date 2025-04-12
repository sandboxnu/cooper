"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("id") ?? null;
  const searchValue = searchParams.get("search") ?? ""; // Get search query from URL
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<
    "default" | "rating" | "newest" | "oldest" | undefined
  >("default");
  const roles = api.role.list.useQuery({
    sortBy: selectedFilter,
    search: searchValue,
  });

  const buttonStyle =
    "bg-white hover:bg-cooper-gray-200 border-white text-black p-2";

  const defaultRole = useMemo(() => {
    if (roles.isSuccess) {
      const role = roles.data.find((role) => role.id === queryParam);
      if (role) {
        return role;
      } else if (roles.data.length > 0) {
        return roles.data[0];
      }
    }
  }, [roles.isSuccess, roles.data, queryParam]);

  const [selectedRole, setSelectedRole] = useState<RoleType | undefined>();

  useEffect(() => {
    // initializes the selectedRole to either the role provided by the query params or the first in the role data
    if (defaultRole) {
      setSelectedRole(defaultRole);
    }
  }, [defaultRole]);

  useEffect(() => {
    // updates the URL when a role is changed
    if (selectedRole && queryParam !== selectedRole.id) {
      router.replace(`/?id=${selectedRole.id}`);
    }
  }, [selectedRole, router, queryParam]);

  return (
    <>
      {roles.isSuccess && roles.data.length > 0 && (
        <div className="flex h-[86dvh] w-full lg:h-[92dvh]">
          {/* TODO: Confirm what background color we want to use here with the designers */}
          <div className="w-[28%] gap-3 overflow-y-auto rounded-tr-lg border-r-[0.75px] border-t-[0.75px] border-cooper-gray-300 bg-cooper-gray-100 p-5 xl:rounded-none">
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
                    roleObj={role}
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
          <div className="col-span-3 w-[72%] overflow-y-auto p-1">
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
