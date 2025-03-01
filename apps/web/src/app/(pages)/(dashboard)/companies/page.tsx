"use client";

import { useRouter } from "next/navigation";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { CompanyCardPreview } from "~/app/_components/reviews/company-card-preview";
import { api } from "~/trpc/react";

export default function Companies() {
  const companies = api.company.list.useQuery();

  const router = useRouter();

  return (
    <>
      {companies.isSuccess && companies.data.length > 0 ? (
        <div className="mb-8 grid h-[70dvh] w-3/4 grid-cols-1 gap-4 overflow-y-scroll md:grid-cols-2 xl:grid-cols-3">
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
    </>
  );
}
