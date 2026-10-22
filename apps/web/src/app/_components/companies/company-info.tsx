import type { CompanyType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";
import NoResults from "../no-results";
import { BackButton } from "../shared/back-button";
import { CompanyHeader } from "./company-overview";
import { CompanyPageContent } from "./company-page-content";
import { averageOfRoleAverages } from "~/utils/ratingHelpers";

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

  return (
    <section className="w-full overflow-y-auto">
      {company.isSuccess && company.data ? (
        // Same spacing as the job view (role-info): back chevron at 16px, the
        // header padded px-4/md:px-6 and py-5, then the section stack
        <div className="w-full pb-5 font-sans">
          {onBack && <BackButton onClick={onBack} className="mx-4 mt-4" />}
          <CompanyHeader
            company={company.data}
            logoClassName="h-20 max-h-20 min-h-20 w-20 min-w-20 max-w-20"
            rating={
              companyReviews.data
                ? {
                    average: averageOfRoleAverages(companyReviews.data),
                    count: companyReviews.data.length,
                  }
                : null
            }
            className={cn(
              "px-4 py-5 md:px-6",
              // Sit close under the mobile back chevron
              onBack && "max-md:pt-2",
            )}
          />
          <div className="px-4 md:px-6">
            <CompanyPageContent company={company.data} />
          </div>
        </div>
      ) : (
        <NoResults className="h-full" />
      )}
    </section>
  );
}
