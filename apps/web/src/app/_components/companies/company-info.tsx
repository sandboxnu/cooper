import type { CompanyType } from "@cooper/db/schema";
import Logo from "@cooper/ui/logo";

import { api } from "~/trpc/react";
import { FavoriteButton } from "../shared/favorite-button";
import { CompanyAbout } from "./company-about";
import { CompanyReview } from "./company-reviews";
import RenderAllRoles from "./all-company-roles";
import NoResults from "../no-results";
import { prettyLocationName } from "~/utils/locationHelpers";

export default function CompanyInfo({
  companyObj,
}: {
  companyObj: CompanyType;
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
      {company.isSuccess ? (
        <div className="mx-4 h-[86dvh] justify-center gap-4 font-sans md:mx-auto md:max-w-[66dvw]">
          <div className="mx-2 mb-6 mt-6 flex items-start justify-between">
            <div className="flex">
              <div className="mr-3 flex h-16 w-16 items-center justify-center">
                {company.data && <Logo company={company.data} size="small" />}
              </div>
              <div>
                <h1 className="text-lg font-semibold">{company.data?.name}</h1>
                <p className="text-md text-gray-600">
                  {locations.length > 1
                    ? `${locations[0]} +${locations.length - 1} ${locations.length - 1 === 1 ? "other" : "others"}`
                    : locations.length === 1
                      ? locations[0]
                      : null}
                </p>
              </div>
            </div>
            {company.data && (
              <FavoriteButton objId={company.data.id} objType="company" />
            )}
          </div>

          <div className="flex flex-row">
            <div className="mx-4 h-[86dvh] w-[70%] gap-4 font-sans md:mx-auto md:max-w-[66dvw] pr-4">
              <div className="mb-6 gap-2 px-1 md:gap-4">
                <CompanyReview companyObj={company.data} />
              </div>

              <div className="my-8 border-t border-cooper-gray-200"></div>

              <CompanyAbout companyObj={company.data} />
            </div>
            <div>
              <RenderAllRoles company={company.data as CompanyType} />
            </div>
          </div>
        </div>
      ) : (
        <NoResults className="h-full" />
      )}
    </section>
  );
}
