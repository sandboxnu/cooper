"use client";

import { IndustryType, LocationType } from "@cooper/db/schema";
import { useRouter } from "next/navigation";

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
  };
}) {
  const companies = api.company.list.useQuery({
    options: {
      industry: searchParams?.industry,
      location: searchParams?.location,
    },
  });

  const locationQuery = api.location.getById.useQuery(
    { id: searchParams?.location ?? '' },
    { enabled: !!searchParams?.location }
  );

  const router = useRouter();

  return (
    <div className="w-[95%] justify-center">
    <SearchFilter searchType="COMPANIES" industry={searchParams?.industry}
        location={locationQuery.data} />
    <hr className="my-4 border-t border-[#9A9A9A] w-full" />  
    <div className="text-[26px]">
    {searchParams?.industry ? (
    <>
      <span className="font-bold">{searchParams.industry.charAt(0) + searchParams.industry.slice(1).toLowerCase()}</span> Companies
    </>
  ) : "Companies"}
  {locationQuery.data && (
    <>
      {" in "}
      <span className="font-bold">
        {locationQuery.data.city}
        {locationQuery.data.state ? `, ${locationQuery.data.state}` : ''}
      </span>
    </>
  )}
      </div>
      <div className="text-cooper-gray-400">
        {companies.data?.length || 0} results
      </div>
      {companies.isSuccess && companies.data.length > 0 ? (
        <div className="mb-8 mt-6 grid h-[86dvh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 xl:grid-cols-3 ">
          {companies.data.map((company) => (
            <div
              key={company.id}
              className="cursor-pointer"
              onClick={() => router.push(`/companies/company?id=${company.id}`)}
            >
              <CompanyCardPreview companyObj={company} className="mb-4" />
            </div>
          ))}
        </div>
      ) : companies.isSuccess && companies.data.length === 0 ? (
        <NoResults />
      ) : companies.isPending ? (
        <LoadingResults />
      ) : null}
    </div>
  );
}
