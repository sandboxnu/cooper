import type { CompanyType } from "@cooper/db/schema";

import { api } from "~/trpc/react";
import NoResults from "../no-results";
import { BackButton } from "../shared/back-button";
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
        <div className="mx-3 justify-center gap-4 font-sans md:mx-auto md:max-w-[66dvw]">
          {onBack && (
            <BackButton onClick={onBack} className="mx-1 mt-4" />
          )}
          <CompanyOverview
            company={company.data}
            locations={locations}
            className="mx-1 my-6 md:mx-2"
          />
        </div>
      ) : (
        <NoResults className="h-full" />
      )}
    </section>
  );
}
