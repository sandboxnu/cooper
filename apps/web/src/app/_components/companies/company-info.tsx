import type { CompanyType } from "@cooper/db/schema";
import Logo from "@cooper/ui/logo";

import { api } from "~/trpc/react";
import { prettyIndustry } from "~/utils/stringHelpers";
import NoResults from "../no-results";
import { FavoriteButton } from "../shared/favorite-button";
import RenderAllRoles from "./all-company-roles";
import { CompanyAbout } from "./company-about";
import { CompanyReview } from "./company-reviews";

export default function CompanyInfo({
  companyObj,
}: {
  companyObj: CompanyType;
}) {
  const companyID = companyObj.id;
  const company = api.company.getById.useQuery({ id: companyID });

  return (
    <section className="w-full overflow-y-auto">
      {company.isSuccess ? (
        <div className="mx-4 h-[86dvh] justify-center gap-4 font-sans md:mx-auto md:max-w-[66dvw]">
          <div className="mx-2 mb-6 mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-16 w-16 items-center justify-center">
                {company.data && <Logo company={company.data} size="small" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{company.data?.name}</h1>
                <p className="text-lg text-gray-600">
                  {prettyIndustry(company.data?.industry)}
                </p>
              </div>
            </div>
            {company.data && (
              <FavoriteButton objId={company.data.id} objType="company" />
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-2 px-1 md:grid-cols-[2fr_3fr] md:gap-4">
            <CompanyAbout companyObj={company.data} />
            <CompanyReview companyObj={company.data} />
          </div>

          <div className="my-8 border-t border-cooper-gray-400"></div>
          <RenderAllRoles company={companyObj.id} />
        </div>
      ) : (
        <NoResults className="h-full" />
      )}
    </section>
  );
}
