"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { cn } from "@cooper/ui";

import { CompanyAbout } from "~/app/_components/companies/company-about";
import { CompanyReview } from "~/app/_components/companies/company-reviews";
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
      {company.isSuccess ? (
        <div className="mx-auto h-[86dvh] w-full max-w-4xl gap-4 font-sans">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-md">
                <Image
                  src={`https://logo.clearbit.com/${company.data?.name.replace(/\s/g, "")}.com`}
                  width={75}
                  height={75}
                  alt={`Logo of ${company.data?.name}`}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">{company.data?.name}</h1>
                <p className="text-sm text-gray-600">
                  Co-op · {company.data?.industry}
                </p>
              </div>
            </div>
            <button className="text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[2fr_3fr]">
            <CompanyAbout companyObj={company.data} />
            <CompanyReview companyObj={company.data} />
          </div>

          <p>Job Postings</p>
          {roles.isSuccess && roles.data.length > 0 ? (
            <div className="mb-8 grid h-[40dvh] w-full grid-cols-1 gap-3 overflow-auto p-1 md:grid-cols-2 xl:grid-cols-3">
              {roles.data.map((role) => {
                return (
                  <div key={role.id} className="p-2">
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
        </div>
      ) : (
        <NoResults />
      )}
    </>
  );
}
