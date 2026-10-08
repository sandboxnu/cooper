"use client";

import Image from "next/image";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";
import { ReportButton } from "../shared/report-button";

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
  isComparing?: boolean;
}

export function ReviewCard({
  reviewObj,
  className,
  isComparing,
}: ReviewCardProps) {
  const { data: location } = api.location.getById.useQuery(
    { id: reviewObj.locationId ?? "" },
    { enabled: !!reviewObj.locationId },
  );

  const workTerm = reviewObj.workTerm
    ? reviewObj.workTerm.charAt(0).toUpperCase() +
      reviewObj.workTerm.slice(1).toLowerCase()
    : "N/A";

  const details = [
    {
      label: "Job type",
      value: reviewObj.jobType === "CO-OP" ? "Co-op" : reviewObj.jobType,
    },
    {
      label: "Work model",
      value: prettyWorkEnviornment(
        reviewObj.workEnvironment as WorkEnvironmentType,
      ),
    },
    { label: "Pay", value: `$${reviewObj.hourlyPay}/hr` },
  ];

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-4 rounded-lg px-1",
        !isComparing && "md:flex-row md:gap-8",
        className,
      )}
    >
      {/* Rating, location and term */}
      <div
        className={cn(
          "flex w-full shrink-0 flex-row items-end justify-between gap-2",
          !isComparing &&
            "md:w-[140px] md:flex-col md:items-start md:self-stretch",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-[36px] leading-none text-cooper-gray-900">
            {reviewObj.overallRating?.toFixed(1) ?? "N/A"}
          </span>
          <div className="relative size-7 shrink-0">
            <Image
              src="/svg/reviewStar.svg"
              alt="Star icon"
              width={23.68}
              height={22.62}
              className="absolute left-[7.72%] top-[5.73%]"
            />
          </div>
        </div>
        <div className="flex flex-col text-sm leading-normal text-cooper-gray-350">
          {location && prettyLocationName(location) && (
            <span>{prettyLocationName(location)}</span>
          )}
          <span>
            {workTerm} {reviewObj.workYear}
          </span>
        </div>
      </div>

      {/* Review text and job details */}
      <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-4 self-stretch pt-1">
        <div className="flex w-full items-start gap-6">
          <p className="min-w-0 flex-1 text-base leading-6 tracking-[-0.16px] text-cooper-gray-900">
            {reviewObj.textReview}
          </p>
          <ReportButton
            entityId={reviewObj.id}
            entityType="review"
            iconOnly={true}
            className="shrink-0"
            icon={
              <Image
                src="/svg/reviewMenu.svg"
                alt="Report review"
                width={6}
                height={22}
              />
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg bg-[#F7F7F7] px-4 py-3 text-sm leading-normal">
          {details.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="whitespace-nowrap text-cooper-gray-350">
                {label}
              </span>
              <span className="text-cooper-gray-900 md:w-20">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
