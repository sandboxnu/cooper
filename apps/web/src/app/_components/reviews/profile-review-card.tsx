"use client";

import Image from "next/image";
import { MoreVertical } from "lucide-react";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { ReviewActionsDialog } from "./review-actions-dialogue";

interface ProfileReviewCardProps {
  reviewObj: ReviewType;
  className?: string;
}

export function ProfileReviewCard({
  reviewObj,
  className,
}: ProfileReviewCardProps) {
  const { data: role } = api.role.getById.useQuery(
    { id: reviewObj.roleId ?? "" },
    { enabled: !!reviewObj.roleId },
  );
  const { data: company } = api.company.getById.useQuery(
    { id: reviewObj.companyId ?? "" },
    { enabled: !!reviewObj.companyId },
  );
  const { data: location } = api.location.getById.useQuery(
    { id: reviewObj.locationId ?? "" },
    { enabled: !!reviewObj.locationId },
  );

  const locationLabel = prettyLocationName(location);
  const subtitle = [company?.name, locationLabel].filter(Boolean).join("  •  ");

  const reviewedDate = new Date(reviewObj.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  return (
    <Card
      className={cn("w-full border mx-auto bg-white hover:bg-white", className)}
    >
      <CardContent className="flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-hanken text-xl leading-7  text-black">
              {role?.title ?? "—"}
            </span>
            <span className="text-[16px] leading-6 tracking-[-0.16px] text-[#7c7e7e]">
              {subtitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-80">
            <div className="flex items-center gap-1">
              <span className="font-hanken text-xl md:text-2xl leading-7 text-black">
                {reviewObj.overallRating?.toFixed(1) ?? "—"}
              </span>
              <Image
                src="/svg/star.svg"
                alt="Star icon"
                width={28}
                height={28}
                className="h-5 w-5 md:h-7 md:w-7"
              />
            </div>
            <ReviewActionsDialog
              review={reviewObj}
              trigger={
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full p-1"
                >
                  <MoreVertical className="h-5 w-5 text-cooper-gray-350" />
                </button>
              }
            />
          </div>
        </div>

        {/* Bottom row */}
        {reviewedDate && (
          <span className="text-sm text-[#7c7e7e]">
            Reviewed on {reviewedDate}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
