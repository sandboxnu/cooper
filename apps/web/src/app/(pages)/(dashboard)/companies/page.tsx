"use client";

import type { IndustryType } from "@cooper/db/schema";
import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";
import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";

export default function Companies({
  searchParams,
}: {
  searchParams?: {
    industry?: IndustryType;
    location?: string;
    search?: string;
  };
}) {
  const companies = api.company.list.useQuery({
    options: {
      industry: searchParams?.industry,
      location: searchParams?.location,
    },
    search: searchParams?.search,
  });

  const locationQuery = api.location.getById.useQuery(
    { id: searchParams?.location ?? "" },
    { enabled: !!searchParams?.location },
  );

  return (
    <div className="w-[95%] justify-center overflow-y-auto md:overflow-y-clip">
      <SearchFilter
        searchType="COMPANIES"
        industry={searchParams?.industry}
        location={locationQuery.data}
      />
      <hr className="mt-4 w-full border-t border-[#9A9A9A]" />
      <div className="md:overflow-y-auto">
        <p className="text-[26px] mt-2">
          {searchParams?.industry ? (
            <>
              <span className="font-bold">
                {searchParams.industry.charAt(0) +
                  searchParams.industry.slice(1).toLowerCase()}
              </span>{" "}
              Companies
            </>
          ) : (
            "Companies"
          )}
          {locationQuery.data && (
            <>
              {" in "}
              <span className="font-bold">
                {locationQuery.data.city}
                {locationQuery.data.state
                  ? `, ${locationQuery.data.state}`
                  : ""}
              </span>
            </>
          )}
        </p>
        <p className="text-cooper-gray-400">
          {companies.data?.length ?? 0} results
        </p>
        {companies.isSuccess && companies.data.length > 0 ? (
          <div className="mb-8 grid h-[70dvh] grid-cols-1 gap-4 md:mt-6 md:h-[75dvh] md:grid-cols-3 xl:grid-cols-4">
            {companies.data.map((company) => (
              <div key={company.id}>
                <CompanyCardPreview companyObj={company} className="mb-4" />
              </div>
            ))}
          </div>
        ) : companies.isSuccess && companies.data.length === 0 ? (
          <NoResults className="h-[70dvh] md:h-[75dvh]" />
        ) : companies.isPending ? (
          <LoadingResults className="h-[70dvh] md:h-[75dvh]" />
        ) : null}
      </div>
    </div>
  );
}
