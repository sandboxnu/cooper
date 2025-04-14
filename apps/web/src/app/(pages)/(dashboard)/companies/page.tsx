"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { IndustryType } from "@cooper/db/schema";

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
  const [page, setPage] = useState<number>(0);

  const { data, fetchNextPage, isSuccess, isPending, hasNextPage } =
    api.company.list.useInfiniteQuery(
      {
        options: {
          industry: searchParams?.industry,
          location: searchParams?.location,
        },
        search: searchParams?.search,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const handleFetchNextPage = async () => {
    if (hasNextPage) {
      await fetchNextPage();
      setPage((prev) => prev + 1);
    }
  };

  const locationQuery = api.location.getById.useQuery(
    { id: searchParams?.location ?? "" },
    { enabled: !!searchParams?.location },
  );

  const router = useRouter();

  const currentPageCompanies =
    data?.pages.slice(0, page + 1).flatMap((page) => page.items) ?? [];

  return (
    <div className="w-[95%] justify-center">
      <SearchFilter
        searchType="COMPANIES"
        industry={searchParams?.industry}
        location={locationQuery.data}
      />
      <hr className="my-4 w-full border-t border-[#9A9A9A]" />
      <div className="text-[26px]">
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
              {locationQuery.data.state ? `, ${locationQuery.data.state}` : ""}
            </span>
          </>
        )}
      </div>
      <div className="text-cooper-gray-400">
        {currentPageCompanies.length} results
      </div>
      {isSuccess && currentPageCompanies.length > 0 ? (
        <div className="mb-8 mt-6 grid h-[86dvh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
          {currentPageCompanies.map((company) => (
            <div
              key={company.id}
              className="cursor-pointer"
              onClick={() => router.push(`/companies/company?id=${company.id}`)}
            >
              <CompanyCardPreview companyObj={company} className="mb-4" />
            </div>
          ))}
        </div>
      ) : !hasNextPage && isSuccess && currentPageCompanies.length === 0 ? (
        <NoResults className="h-full" />
      ) : isPending ? (
        <LoadingResults className="h-full" />
      ) : null}
    </div>
  );
}
