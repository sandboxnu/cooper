"use client";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";
import { prettyLocationName } from "~/utils/locationHelpers";
import { api } from "~/trpc/react";
import { formatDate } from "~/utils/dateHelpers";
import { YellowStar } from "./review-card-stars";

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ reviewObj, className }: ReviewCardProps) {
  const { data: role } = api.role.getById.useQuery(
    { id: reviewObj.roleId ?? ""},
    { enabled: !!reviewObj.roleId },
  );

  const { data: location } = api.location.getById.useQuery({
    id: reviewObj.locationId ?? "",
  });

  const { data: company } = api.company.getById.useQuery(
    { id: reviewObj.companyId ?? ""},
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
              <span className="text-xl font-medium text-black">
                {roleTitle}
              </span>
            </div>
            <div className="flex items-start w-full justify-end">
              <div className="mt-2 flex items-center gap-2 md:gap-2">
                <span className=" text-black md:text-2xl">
                  {reviewObj.overallRating?.toFixed(1) ?? "0.0"}
                </span>
                <YellowStar className="h-5 w-5 md:h-7 md:w-7" />
              </div>
            </div>
          </CardContent>
        </div>
        <div className="w-full">
          <CardContent className="flex h-full flex-col justify-between gap-3 sm:pl-0">
            <div className="w-full text-black text-base">
              <span className="text-black text-base text-opacity-60">
                {company?.name}
              </span>

              <span className="text-black text-opacity-60"> • </span>
              <span className="text-black text-base text-opacity-60">
                {prettyLocationName(location)}
              </span>
            </div>
            <div className="flex gap-1 text-sm text-black pt-2 text-opacity-60">
              <span>
                Reviewed on{" "}
                {formatDate(reviewObj.createdAt)}
              </span>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
