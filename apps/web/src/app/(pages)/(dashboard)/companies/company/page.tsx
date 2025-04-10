"use client";

import { useSearchParams } from "next/navigation";

import Logo from "@cooper/ui/logo";

import RenderAllRoles from "~/app/_components/companies/all-company-roles";
import { CompanyAbout } from "~/app/_components/companies/company-about";
import { CompanyReview } from "~/app/_components/companies/company-reviews";
import NoResults from "~/app/_components/no-results";
import { FavoriteButton } from "~/app/_components/shared/favorite-button";
import { api } from "~/trpc/react";
import { prettyIndustry } from "~/utils/stringHelpers";

export default function Company() {
  const searchParams = useSearchParams();
  const companyID = searchParams.get("id");

  const company = api.company.getById.useQuery({ id: companyID ?? "" });

  return (
    <>
      {company.isSuccess ? (
        <div className="mx-auto h-[86dvh] w-full max-w-[66dvw] justify-center gap-4 overflow-auto font-sans">
          <div className="mb-6 mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-16 w-16 items-center justify-center">
                {company.data && <Logo company={company.data} size="small" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{company.data?.name}</h1>
                <p className="text-lg text-gray-600">
                  Co-op · {prettyIndustry(company.data?.industry)}
                </p>
              </div>
            </div>
            {company.data && (
              <FavoriteButton objId={company.data.id} objType="company" />
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 px-1 md:grid-cols-[2fr_3fr]">
            <CompanyAbout companyObj={company.data} />
            <CompanyReview companyObj={company.data} />
          </div>

          <div className="my-8 border-t border-cooper-gray-400"></div>
          <RenderAllRoles company={companyID} />
        </div>
      ) : (
        <NoResults className="h-full" />
      )}
    </>
  );
}
