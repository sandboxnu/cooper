"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

import type {
  ReviewType,
  RoleType,
  WorkEnvironmentType,
  WorkTermType,
} from "@cooper/db/schema";
import { WorkEnvironment, WorkTerm } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { useToast } from "@cooper/ui/hooks/use-toast";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { ReviewCard } from "~/app/_components/reviews/review-card";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";

export default function Roles({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    cycle?: WorkTermType;
    term?: WorkEnvironmentType;
  };
}) {
  const { toast } = useToast();

  const RolesSearchParam = z.object({
    cycle: z
      .nativeEnum(WorkTerm, {
        message: "Invalid cycle type",
      })
      .optional(),
    term: z
      .nativeEnum(WorkEnvironment, {
        message: "Invalid term type",
      })
      .optional(),
  });

  const validationResult = RolesSearchParam.safeParse(searchParams);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !validationResult.success) {
      toast({
        title: "Invalid Search Parameters",
        description: validationResult.error.issues
          .map((issue) => issue.message)
          .join(", "),
        variant: "destructive",
      });
      setMounted(false);
    }
  }, [toast, mounted, validationResult]);

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
      {/* <SearchFilter search={searchParams?.search} {...validationResult.data} /> */}
      {roles.isSuccess && roles.data.length > 0 && (
        <div className="divide flex h-[100dvh] w-[95%] gap-4 divide-x-2 pl-4 pr-4 lg:w-[95%]">
          <div className="col-span-2 w-[28%] gap-3 overflow-auto pl-1 pr-4 pt-1">
            {roles.data.map((role, i) => {
              return (
                <div key={role.id} onClick={() => setSelectedRole(role)}>
                  <RoleCardPreview
                    reviewObj={role}
                    className={cn(
                      "mb-4 hover:bg-cooper-gray-100",
                      selectedRole
                        ? selectedRole.id === role.id &&
                            "border-2 bg-cooper-gray-200"
                        : !i && "border-2 bg-cooper-gray-200",
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
