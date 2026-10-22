"use client";

import type { CompanyType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import Image from "next/image";
import Logo from "@cooper/ui/logo";


import { FavoriteButton } from "../shared/favorite-button";
import { OptionsMenu } from "../shared/options-menu";
import { useCompanyLocation } from "../shared/use-company-location";

const SEE_FULL_DETAILS_CLASS =
  "whitespace-nowrap text-[16px] font-bold leading-6 tracking-[-0.16px] text-cooper-gray-350 transition hover:text-cooper-gray-400";

interface CompanyHeaderProps {
  company: CompanyType;
  // Shows a "See full details" link next to the save button (popup)
  onSeeFullDetails?: () => void;
  // Company page passes a bigger logo; the popup keeps the default
  logoClassName?: string;
  // Star rating beside the location, like the job header; omitted when there
  // are no reviews
  rating?: { average: number; count: number } | null;
  className?: string;
}

// Logo, name, location and save/options; shared by the company page and popup
export function CompanyHeader({
  company,
  onSeeFullDetails,
  logoClassName = "h-[59px] max-h-[59px] min-h-[59px] w-[59px] min-w-[59px] max-w-[59px]",
  rating,
  className,
}: CompanyHeaderProps) {
  const locationLabel = useCompanyLocation(company.id);

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <Logo company={company} className={logoClassName} />
      {/* Same layout as the job header: title beside the buttons, then a
          location + rating row */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-4">
          <h1 className="min-w-0 flex-1 break-words text-[24px] font-semibold leading-8 text-cooper-gray-900">
            {company.name}
          </h1>
          <div className="flex shrink-0 items-center gap-4">
            {/* Beside the buttons from sm; below the location on phones,
                where it would crowd the name */}
            {onSeeFullDetails && (
              <button
                type="button"
                onClick={onSeeFullDetails}
                className={cn(SEE_FULL_DETAILS_CLASS, "hidden sm:block")}
              >
                See full details
              </button>
            )}
            <FavoriteButton objId={company.id} objType="company" />
            <OptionsMenu
              entityType="company"
              entityId={company.id}
              entityName={company.name}
            />
          </div>
        </div>
        {/* Like the job header, location and rating wrap onto separate lines
            rather than squeezing each other; a wrapped rating sits at the
            left. ml-auto keeps a lone rating (no location) on the right */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[16px] leading-6 text-cooper-gray-400">
          {locationLabel && <p>{locationLabel}</p>}
          {rating && rating.count > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 whitespace-nowrap",
                !locationLabel && "ml-auto",
              )}
            >
              <Image
                src="/svg/star.svg"
                alt="Star icon"
                width={20}
                height={20}
              />
              <div>{Math.round(rating.average * 100) / 100}</div>(
              {rating.count} review{rating.count !== 1 && "s"})
            </div>
          )}
        </div>
        {onSeeFullDetails && (
          <button
            type="button"
            onClick={onSeeFullDetails}
            className={cn(SEE_FULL_DETAILS_CLASS, "mt-1 self-start sm:hidden")}
          >
            See full details
          </button>
        )}
      </div>
    </div>
  );
}
