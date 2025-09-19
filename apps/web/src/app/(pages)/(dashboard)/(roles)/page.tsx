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
      const params = new URLSearchParams(window.location.search);
      params.set("id", selectedRole.id);
      router.replace(`/?${params.toString()}`);
    }
  }, [selectedRole, router, queryParam]);

  const [showRoleInfo, setShowRoleInfo] = useState(false); // State for toggling views on mobile

  return (
    <>
      {roles.isSuccess && roles.data.length > 0 && (
        <div className="flex h-[81.5dvh] max-h-full w-full lg:h-[90dvh]">
          {/* RoleCardPreview List */}
          <div
            className={cn(
              "w-full overflow-y-auto border-r-[0.75px] border-t-[0.75px] border-cooper-gray-300 bg-cooper-gray-100 p-5 md:rounded-tr-lg xl:rounded-none",
              "md:w-[28%]", // Show as 28% width on md and above
              showRoleInfo && "hidden md:block", // Hide on mobile if RoleInfo is visible
            )}
          >
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
                <div
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setShowRoleInfo(true); // Show RoleInfo on mobile
                  }}
                >
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

          {/* RoleInfo */}
          <div
            className={cn(
              "col-span-3 w-full overflow-y-auto p-1",
              "md:w-[72%]", // Show as 72% width on md and above
              !showRoleInfo && "hidden md:block", // Hide on mobile if RoleCardPreview is visible
            )}
          >
            {roles.data.length > 0 && roles.data[0] && (
              <RoleInfo
                roleObj={selectedRole ?? roles.data[0]}
                onBack={() => setShowRoleInfo(false)}
              />
            )}
          </div>
        </div>
      )}
      {roles.isSuccess && roles.data.length === 0 && (
        <NoResults className="h-[84dvh]" />
      )}
      {roles.isPending && <LoadingResults className="h-[84dvh]" />}
    </>
  );
}
