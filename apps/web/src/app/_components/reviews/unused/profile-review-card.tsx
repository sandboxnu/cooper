"use client";

import type { ReviewType } from "@cooper/db/schema";
import { Card, CardContent } from "@cooper/ui/card";
import { prettyLocationName } from "~/utils/locationHelpers";
import { api } from "~/trpc/react";
import { YellowStar } from "../review-card-stars";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";
import { DeleteReviewDialog } from "../delete-review-dialogue";
import { ReportButton } from "../../shared/report-button";
import type { WorkEnvironmentType } from "@cooper/db/schema";

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ reviewObj }: ReviewCardProps) {
  const { data: role } = api.role.getById.useQuery(
    { id: reviewObj.roleId ?? "" },
    { enabled: !!reviewObj.roleId },
  );

  // Get the current user's profile
  const { data: currentProfile } = api.profile.getCurrentUser.useQuery();

  // Check if the current user is the author of the review
  const isAuthor = currentProfile?.id === reviewObj.profileId;

  const { data: location } = api.location.getById.useQuery({
    id: reviewObj.locationId ?? "",
  });

  const { data: company } = api.company.getById.useQuery(
    { id: reviewObj.companyId ?? "" },
    { enabled: !!reviewObj.companyId },
  );

  const roleTitle = role?.title.trim();

  return (
    <Card>
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
            <div className="flex justify-between text-sm">
              <div className="flex gap-6 rounded-lg bg-[#f4f4f4] p-3 pr-4 md:gap-10 md:pl-4">
                <div className="flex flex-col gap-2 md:flex-row">
                  <span className="text-cooper-gray-350">Job type</span>{" "}
                  {reviewObj.jobType === "CO-OP" ? "Co-op" : reviewObj.jobType}
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <span className="text-cooper-gray-350">Work model</span>
                  {prettyWorkEnviornment(
                    reviewObj.workEnvironment as WorkEnvironmentType,
                  )}
                </div>
                <div className="flex flex-col gap-2 md:flex-row">
                  <span className="text-cooper-gray-350">Pay</span> $
                  {reviewObj.hourlyPay}/hr
                </div>
              </div>
              <ReportButton
                entityId={reviewObj.id}
                entityType="review"
                iconOnly={true}
              />
            </div>
            <div className="visible flex flex-row justify-between md:hidden">
              <div className="pt-1">{reviewObj.textReview}</div>
              {isAuthor && <DeleteReviewDialog reviewId={reviewObj.id} />}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
