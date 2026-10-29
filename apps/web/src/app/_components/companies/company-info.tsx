import type { CompanyType } from "@cooper/db/schema";

import { api } from "~/trpc/react";
import NoResults from "../no-results";
import { CompanyOverview } from "./company-overview";
import { prettyLocationName } from "~/utils/locationHelpers";

export default function CompanyInfo({
  companyObj,
  onBack,
}: {
  companyObj: CompanyType;
  onBack?: () => void;
}) {
  const companyID = companyObj.id;
  const company = api.company.getById.useQuery({ id: companyID });

  const companyReviews = api.review.getByCompany.useQuery(
    {
      id: companyID,
    },
    {
      enabled: !!companyID,
    },
  );

  const uniqueLocationIds = Array.from(
    new Set(
      (companyReviews.data ?? [])
        .map((review) => review.locationId)
        .filter((id): id is string => !!id),
    ),
  );

  const locationQueries = api.useQueries((t) =>
    uniqueLocationIds.map((id) =>
      t.location.getById({ id }, { enabled: !!id }),
    ),
  );

  const locations = locationQueries
    .map((query) => (query.data ? prettyLocationName(query.data) : null))
    .filter((loc): loc is string => !!loc);

  return (
    <section className="w-full overflow-y-auto">
      {company.isSuccess && company.data ? (
        <div className="mx-4 justify-center gap-4 font-sans md:mx-auto md:max-w-[66dvw]">
          {onBack && (
            <svg
              width="14"
              height="12"
              viewBox="0 0 14 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="m-4 block min-w-3 hover:cursor-pointer md:hidden"
              onClick={onBack}
            >
              <path
                d="M13.41 10.59L12 12L6 6L12 0L13.41 1.41L8.83 6L13.41 10.59ZM7.41 10.59L6 12L0 6L6 0L7.41 1.41L2.83 6L7.41 10.59Z"
                fill="#5A5A5A"
              />
            </svg>
          )}
          <CompanyOverview
            company={company.data}
            locations={locations}
            className="mx-2 my-6"
          />
        </div>
      ) : (
        <NoResults className="h-full" />
      )}
    </section>
  );
}
