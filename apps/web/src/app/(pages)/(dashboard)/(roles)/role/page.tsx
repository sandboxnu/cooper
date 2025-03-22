"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { RoleType } from "@cooper/db/schema";

import RenderAllRoles from "~/app/_components/companies/all-company-roles";
import { CompanyAbout } from "~/app/_components/companies/company-about";
import { CompanyReview } from "~/app/_components/companies/company-reviews";
import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleInfo } from "~/app/_components/reviews/role-info";
import { api } from "~/trpc/react";
import { prettyIndustry } from "~/utils/stringHelpers";

export default function Role() {
  const searchParams = useSearchParams();
  const roleId = searchParams.get("id");

  const role = api.role.getById.useQuery({ id: roleId ?? "" });

  return (
    <>
      {role.isSuccess && (
        <div className="col-span-3 w-[72%] overflow-auto p-1">
          <RoleInfo roleObj={role.data as RoleType} />
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
