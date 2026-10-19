"use client";

import type { CompanyType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import Logo from "@cooper/ui/logo";

import { FavoriteButton } from "../shared/favorite-button";
import { ReportButton } from "../shared/report-button";
import RenderAllRoles from "./all-company-roles";
import { CompanyAbout } from "./company-about";
import { CompanyReview } from "./company-reviews";

interface CompanyOverviewProps {
  company: CompanyType;
  locations?: (string | null)[];
  // Shows a "See full details" link in the header (used by the popup)
  onSeeFullDetails?: () => void;
  // Called when a role in the roles panel is opened
  onRoleSelect?: () => void;
  className?: string;
}

// Company header, about, rating and roles panel; shared by the company popup
// and the company view on /roles
export function CompanyOverview({
  company,
  locations,
  onSeeFullDetails,
  onRoleSelect,
  className,
}: CompanyOverviewProps) {
  const knownLocations = (locations ?? []).filter(
    (loc): loc is string => !!loc,
  );
  const locationLabel =
    knownLocations.length > 1
      ? `${knownLocations[0]} +${knownLocations.length - 1} ${knownLocations.length - 1 === 1 ? "other" : "others"}`
      : (knownLocations[0] ?? null);

  return (
    <div className={cn("flex flex-col gap-7", className)}>
      <div className="flex items-center gap-4">
        <Logo
          company={company}
          className="h-[59px] max-h-[59px] min-h-[59px] w-[59px] min-w-[59px] max-w-[59px]"
        />
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-[24px] font-semibold leading-normal text-cooper-gray-900">
              {company.name}
            </h1>
            {locationLabel && (
              <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-400">
                {locationLabel}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {onSeeFullDetails && (
              <button
                type="button"
                onClick={onSeeFullDetails}
                className="text-[16px] font-bold leading-6 tracking-[-0.16px] text-cooper-gray-350 transition hover:text-cooper-gray-400"
              >
                See full details
              </button>
            )}
            <FavoriteButton objId={company.id} objType="company" />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-7 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-7 md:overflow-y-auto md:px-3">
          <CompanyAbout companyObj={company} />
          <hr className="border-t border-cooper-gray-150" />
          <CompanyReview companyObj={company} />
          <ReportButton
            entityId={company.id}
            entityType="company"
            iconOnly={false}
          />
        </div>
        {/* Fixed height when stacked; beside the left column it stretches to
            match it, capped so a long role list scrolls inside the panel */}
        <div className="h-[418px] md:h-auto md:max-h-[70dvh] md:w-[354px] md:shrink-0">
          <RenderAllRoles company={company} onClose={onRoleSelect} />
        </div>
      </div>
    </div>
  );
}
