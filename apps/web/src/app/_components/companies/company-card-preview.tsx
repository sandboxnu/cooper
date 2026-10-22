"use client";

import Image from "next/image";

import type { CompanyType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";
import Logo from "@cooper/ui/logo";

import { api } from "~/trpc/react";
import { LIST_CARD_HEIGHT_CLASS } from "../shared/card-height";
import { FavoriteButton } from "../shared/favorite-button";
import { useCompanyLocation } from "../shared/use-company-location";

interface CompanyCardPreviewProps {
  className?: string;
  companyObj: CompanyType;
  // Replaces the save button in the top right (e.g. a remove X); pass null
  // to show nothing there
  action?: React.ReactNode;
  // No hover state or save button, with medium gray text; used while
  // comparing jobs, since companies can't be compared (clicking opens the
  // company popup instead)
  muted?: boolean;
}

export function CompanyCardPreview({
  companyObj,
  className,
  action,
  muted = false,
}: CompanyCardPreviewProps) {
  const locationLabel = useCompanyLocation(companyObj.id);

  const avg = api.company.getAverageById.useQuery({
    companyId: companyObj.id,
  });
  const reviews = api.review.getByCompany.useQuery({
    id: companyObj.id,
  });

  const raw = Number(avg.data?.averageOverallRating);
  const averageRating = Number.isFinite(raw)
    ? Math.round(raw * 100) / 100
    : null;

  return (
    <Card
      className={cn(
        "flex flex-col justify-between rounded-lg hover:cursor-pointer",
        LIST_CARD_HEIGHT_CLASS,
        className,
        // Keep the tinted background on hover
        muted && "hover:bg-cooper-gray-50",
      )}
    >
      <div className="flex space-x-4">
        <Logo company={companyObj} />
        <div className="w-full">
          <CardHeader>
            <div className="flex items-center justify-start">
              {/* Same spacing as the job card: 22.5px title row, 2px gap,
                  location, then 8px before the rating */}
              <div className="flex w-full flex-col gap-0.5">
                <CardTitle>
                  <div className="text-md flex w-full items-start justify-between gap-3 md:text-xl">
                    <div
                      className={cn(
                        "min-w-0 truncate text-lg font-medium leading-tight",
                        muted ? "text-cooper-gray-350" : "text-cooper-gray-900",
                      )}
                    >
                      {companyObj.name}
                    </div>
                    {/* Block box the title row's height, so the inline line
                        height doesn't make the row taller than the name */}
                    <span
                      className="flex h-[22.5px] shrink-0 items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {muted ? null : action === undefined ? (
                        <FavoriteButton
                          objId={companyObj.id}
                          objType="company"
                        />
                      ) : (
                        action
                      )}
                    </span>
                  </div>
                </CardTitle>
                <div
                  className={cn(
                    "flex min-w-0 gap-2 text-base",
                    muted ? "text-cooper-gray-350" : "text-cooper-gray-400",
                  )}
                >
                  <span className="truncate">
                    {locationLabel ?? "Location not specified"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-2">
            {averageRating !== 0 ? (
              <div
                className={cn(
                  "flex flex-row items-center gap-2",
                  muted ? "text-cooper-gray-350" : "text-cooper-gray-400",
                )}
              >
                <div className="flex gap-1 items-center">
                  <Image
                    src="/svg/star.svg"
                    alt="Star icon"
                    width={20}
                    height={20}
                  />
                  <div>{averageRating}</div>
                </div>
                ({reviews.data?.length}{" "}
                {reviews.data?.length === 1 ? "review" : "reviews"})
              </div>
            ) : (
              <div
                className={
                  muted ? "text-cooper-gray-350" : "text-cooper-gray-400"
                }
              >
                No ratings yet
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
