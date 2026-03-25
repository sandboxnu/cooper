"use client";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";
import { prettyLocationName } from "~/utils/locationHelpers";
import { api } from "~/trpc/react";
import { YellowStar, GrayStar } from "./review-card-stars";
import { formatLastEditedDate } from "~/utils/dateHelpers";

interface DraftReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function DraftReviewCard({
  reviewObj,
  className,
}: DraftReviewCardProps) {
  const { data: role } = api.role.getById.useQuery(
    { id: reviewObj.roleId },
    { enabled: !!reviewObj.roleId },
  );

  const { data: location } = api.location.getById.useQuery({
    id: reviewObj.locationId ?? "",
  });

  const { data: company } = api.company.getById.useQuery(
    { id: reviewObj.companyId },
    { enabled: !!reviewObj.companyId },
  );

  const roleTitle = role?.title.trim();

  return (
    <Card
      className={cn(
        "border-cooper-gray-150 mx-auto w-[100%] border-[0.75px] bg-[#FEFEFE]",
        className,
      )}
    >
      <div className="flex w-full flex-wrap">
        <div className="w-full">
          <CardContent className="flex h-full">
            <div className="flex w-full items-center justify-start gap-3">
              {roleTitle ? (
                <span className="text-xl font-medium text-cooper-gray-250">
                  {roleTitle}
                </span>
              ) : ""}
              <span className="flex items-center gap-2 text-lg font-medium text-red-600">
                <span className="flex items-center h-2 w-2 rounded-full bg-red-600"></span>
                Draft
              </span>
            </div>
            <div className="flex items-start w-full justify-end">
              <div className="mt-2 flex items-center gap-2 md:gap-2">
                <div className="text-2xl text-[#151515] md:text-2xl">
                  {(reviewObj.overallRating || 0).toFixed(1)}
                </div>
                {!reviewObj.overallRating ? (
                  <GrayStar className="h-5 w-5 md:h-7 md:w-7" />
                ) : (
                  <YellowStar className="h-5 w-5 md:h-7 md:w-7" />
                )}
              </div>
            </div>
          </CardContent>
        </div>
        <div className="w-full">
          <CardContent className="flex h-full flex-col justify-between gap-3 sm:pl-0">
            <div className="align-center text-cooper-gray-250 flex flex-col text-base">
              <span
                className={`${location && prettyLocationName(location) ? "visibility: visible" : "visibility: hidden"}`}
              >
                {company?.name} • {prettyLocationName(location)}
              </span>
            </div>
            <div className="flex gap-1 text-sm text-cooper-gray-250 pt-2">
              <span>
                {formatLastEditedDate(reviewObj.updatedAt, reviewObj.createdAt)}
              </span>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
