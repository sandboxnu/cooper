"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { cn } from "@cooper/ui";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { api } from "~/trpc/react";

export default function Company() {
  const searchParams = useSearchParams();
  const companyID = searchParams.get("id"); // Get 'id' from the URL

  const company = api.company.getById.useQuery({ id: companyID ?? "" });
  const roles = api.role.getByCompany.useQuery({ companyId: companyID ?? "" });

  useEffect(() => {
    console.log("Company ID:", companyID); // Debugging: Check if id is retrieved correctly
  }, [companyID]);

  return (
    <>
      <div>
        <h1>{company.data?.name}</h1>
        <p>{"co-op : " + company.data?.industry}</p>
      </div>
      <p>Job Postings</p>
      {roles.isSuccess && roles.data.length > 0 ? (
        <div className="mb-8 grid h-[70dvh] w-3/4 grid-cols-1 gap-4 overflow-y-scroll md:grid-cols-2 xl:grid-cols-3">
          {roles.data.map((role, i) => {
            return (
              <div key={role.id}>
                <RoleCardPreview
                  reviewObj={role}
                  className={cn("mb-4 hover:bg-cooper-gray-100")}
                />
              </div>
            );
          })}
        </div>
      ) : roles.isSuccess && roles.data.length === 0 ? (
        <NoResults />
      ) : roles.isPending ? (
        <LoadingResults />
      ) : null}
    </>
  );
}
